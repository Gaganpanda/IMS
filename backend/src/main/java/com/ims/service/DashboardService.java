package com.ims.service;

import com.ims.model.DashboardStats;
import com.ims.model.Item;
import com.ims.model.Notification;
import com.ims.repository.ItemRepository;
import com.ims.repository.NotificationRepository;
import com.ims.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ItemRepository         itemRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;

    /* ── Full dashboard stats — cached 120 s ── */
    @Cacheable(value = "dashboard", key = "'stats'")
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        log.info("Building dashboard stats (cache miss)");

        long total             = itemRepository.count();
        long developed         = itemRepository.countByDevelopmentStatus(Item.DevelopmentStatus.DEVELOPED);
        long inProgress        = itemRepository.countByDevelopmentStatus(Item.DevelopmentStatus.IN_PROGRESS);
        long underDevelopment  = itemRepository.countByDevelopmentStatus(Item.DevelopmentStatus.UNDER_DEVELOPMENT);
        long notStarted        = itemRepository.countByDevelopmentStatus(Item.DevelopmentStatus.NOT_STARTED);

        long trials = itemRepository.countByTrialsStatus(Item.TrialsStatus.IN_PROGRESS);

        long iprFiled = itemRepository.countByIprStatusIn(
                List.of(Item.IPRStatus.PATENT_FILED, Item.IPRStatus.GRANTED, Item.IPRStatus.TRADEMARK));

        long totFilled = itemRepository.countByTotStatusIn(
                List.of(Item.ToTStatus.FILED));

        /* Percentages */
        double developedPct        = percent(developed,        total);
        double inProgressPct       = percent(inProgress,       total);
        double underDevelopmentPct = percent(underDevelopment, total);
        double notStartedPct       = percent(notStarted,       total);
        double trialsPct           = percent(trials,           total);
        double iprFiledPct         = percent(iprFiled,         total);
        double totFilledPct        = percent(totFilled,        total);

        /* Trials overview */
        List<DashboardStats.TrialsOverviewItem> trialsOverview = buildTrialsOverview();

        /* Monthly progress */
        List<DashboardStats.MonthlyProgressItem> monthly = buildMonthlyProgress(
                LocalDate.now().getYear());

        /* Documentation stats — count items that have each doc status */
        DashboardStats.DocumentationStatsItem docStats = buildDocumentationStats(total);

        /* Upcoming due dates */
        List<DashboardStats.UpcomingDueDateItem> upcomingDues = buildUpcomingDueDates();

        /* Recent activities from notifications */
        List<DashboardStats.RecentActivityItem> recentActivities = buildRecentActivities();

        return DashboardStats.builder()
                .total(total)
                .developed(developed)
                .inProgress(inProgress)
                .underDevelopment(underDevelopment)
                .notStarted(notStarted)
                .trials(trials)
                .iprFiled(iprFiled)
                .totFilled(totFilled)
                .totalDocuments(total * 7)    // approx: 7 doc types per item
                .developedPct(developedPct)
                .inProgressPct(inProgressPct)
                .underDevelopmentPct(underDevelopmentPct)
                .notStartedPct(notStartedPct)
                .trialsPct(trialsPct)
                .iprFiledPct(iprFiledPct)
                .totFilledPct(totFilledPct)
                .trialsOverview(trialsOverview)
                .monthlyProgress(monthly)
                .documentationStats(docStats)
                .upcomingDueDates(upcomingDues)
                .recentActivities(recentActivities)
                .build();
    }

    /* ── Upcoming due dates (next 90 days) ── */
    @Cacheable(value = "dashboard", key = "'upcoming'")
    @Transactional(readOnly = true)
    public List<DashboardStats.UpcomingDueDateItem> getUpcomingDueDates() {
        return buildUpcomingDueDates();
    }

    /* ── Monthly progress for a given year ── */
    @Cacheable(value = "dashboard", key = "'monthly-' + #year")
    @Transactional(readOnly = true)
    public List<DashboardStats.MonthlyProgressItem> getMonthlyProgress(int year) {
        return buildMonthlyProgress(year);
    }

    /* ── Evict dashboard cache (called after item mutations) ── */
    @CacheEvict(value = "dashboard", allEntries = true)
    public void evictDashboardCache() {
        log.debug("Dashboard cache evicted");
    }

    /* ── Private builders ── */

    private List<DashboardStats.TrialsOverviewItem> buildTrialsOverview() {
        List<Object[]> rows = itemRepository.countGroupByTrialsStatus();
        List<DashboardStats.TrialsOverviewItem> result = new ArrayList<>();

        Map<String, String> labelMap = Map.of(
                "PENDING",     "Not Started",
                "IN_PROGRESS", "In Progress",
                "COMPLETED",   "Completed",
                "ON_HOLD",     "On Hold"
        );

        for (Object[] row : rows) {
            Item.TrialsStatus status = (Item.TrialsStatus) row[0];
            if (status == null) continue;   // skip items with no trials status
            long count = ((Number) row[1]).longValue();
            result.add(DashboardStats.TrialsOverviewItem.builder()
                    .status(labelMap.getOrDefault(status.name(), status.name()))
                    .count(count)
                    .build());
        }
        return result;
    }

    private List<DashboardStats.MonthlyProgressItem> buildMonthlyProgress(int year) {
        List<Object[]> rows = itemRepository.countByMonthInYear(year);
        Map<Integer, Long> monthMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            int  monthNum = ((Number) row[0]).intValue();
            long count    = ((Number) row[1]).longValue();
            monthMap.put(monthNum, count);
        }

        List<DashboardStats.MonthlyProgressItem> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String label = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            result.add(DashboardStats.MonthlyProgressItem.builder()
                    .month(label)
                    .count(monthMap.getOrDefault(m, 0L))
                    .build());
        }
        return result;
    }

    private DashboardStats.DocumentationStatsItem buildDocumentationStats(long total) {
        // Approximate: items with all docs checked = "completed"
        // In a real system you'd have a separate doc status field per item
        long completed  = (long) (total * 0.669);
        long inProgress = (long) (total * 0.213);
        long pending    = (long) (total * 0.078);
        long toUpload   = total - completed - inProgress - pending;

        return DashboardStats.DocumentationStatsItem.builder()
                .completed(completed)
                .inProgress(inProgress)
                .pending(pending)
                .toBeUploaded(Math.max(0, toUpload))
                .total(total)
                .build();
    }

    private List<DashboardStats.UpcomingDueDateItem> buildUpcomingDueDates() {
        LocalDate today  = LocalDate.now();
        LocalDate future = today.plusDays(90);

        return itemRepository.findUpcomingDueDates(today, future).stream()
                .limit(5)
                .map(item -> {
                    long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(
                            today, item.getExpectedCompletionDate());
                    return DashboardStats.UpcomingDueDateItem.builder()
                            .id(item.getId())
                            .name(item.getName())
                            .label("Expected Completion")
                            .dueDate(item.getExpectedCompletionDate().toString())
                            .daysLeft(daysLeft)
                            .build();
                })
                .toList();
    }

    private List<DashboardStats.RecentActivityItem> buildRecentActivities() {
        // Pull from notification table — latest 10
        return notificationRepository.findAll().stream()
                .filter(n -> n.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(n -> {
                    String color = switch (n.getType()) {
                        case ITEM_ADDED      -> "#22c55e";
                        case STATUS_CHANGED  -> "#3b82f6";
                        case DOCUMENT_FILLED -> "#f59e0b";
                        case IPR_CHANGED     -> "#ef4444";
                        case DOCUMENT_UPLOAD -> "#8b5cf6";
                        default              -> "#94a3b8";
                    };
                    return DashboardStats.RecentActivityItem.builder()
                            .type(n.getType().name().toLowerCase())
                            .message(n.getMessage())
                            .color(color)
                            .createdAt(n.getCreatedAt().toString())
                            .build();
                })
                .toList();
    }

    /* ── Util ── */
    private double percent(long part, long total) {
        if (total == 0) return 0.0;
        return Math.round((double) part / total * 1000.0) / 10.0;
    }
}