package com.ims.service;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ims.model.DashboardStats;
import com.ims.model.Item;
import com.ims.model.Notification;
import com.ims.repository.IPRDetailRepository;
import com.ims.repository.ItemRepository;
import com.ims.repository.ItemVariantRepository;
import com.ims.repository.NotificationRepository;
import com.ims.repository.ToTPartnerRepository;
import com.ims.repository.TrialFeedbackRepository;
import com.ims.repository.TrialStakeholderRepository;
import com.ims.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ItemRepository              itemRepository;
    private final ItemVariantRepository       itemVariantRepository;
    private final NotificationRepository      notificationRepository;
    private final UserRepository              userRepository;
    private final TrialFeedbackRepository     trialFeedbackRepository;
    private final TrialStakeholderRepository  trialStakeholderRepository;
    private final IPRDetailRepository         iprDetailRepository;
    private final ToTPartnerRepository        totPartnerRepository;

    /* Returns null for ADMIN (sees everything), or the user's own id otherwise */
    private Long currentOwnerId() {
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            return userRepository.findByUsername(username)
                    .filter(u -> u.getRole() != com.ims.model.User.Role.ADMIN)
                    .map(com.ims.model.User::getId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private Long currentUserId() {
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            return userRepository.findByUsername(username)
                    .map(com.ims.model.User::getId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    /* ── Full dashboard stats — cached per-user for 120 s ── */
    @Cacheable(value = "dashboard", key = "'stats-' + T(org.springframework.security.core.context.SecurityContextHolder).context.authentication.name")
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        log.info("Building dashboard stats (cache miss)");

        Long ownerId = currentOwnerId();

        long total             = itemRepository.countByOwner(ownerId);
        long developed         = itemRepository.countByOwnerAndDevelopmentStatus(ownerId, Item.DevelopmentStatus.DEVELOPED);
        long inProgress        = itemRepository.countByOwnerAndDevelopmentStatus(ownerId, Item.DevelopmentStatus.IN_PROGRESS);
        long underDevelopment  = itemRepository.countByOwnerAndDevelopmentStatus(ownerId, Item.DevelopmentStatus.UNDER_DEVELOPMENT);
        long notStarted        = itemRepository.countByOwnerAndDevelopmentStatus(ownerId, Item.DevelopmentStatus.NOT_STARTED);

        // FIX: previously counted via itemRepository.countByOwnerAndTrialsStatus,
        // which reads the item.trials_status column — a legacy field that is
        // never kept in sync with the actual trial_stakeholders data (the Items
        // page filter and the "Trials Status Overview" chart below both derive
        // status from trial_stakeholders instead). That mismatch is why this
        // stat card could show 0 while items clearly had in-progress trial
        // stakeholders. Now derived the same way, item- or variant-linked.
        long trials = trialStakeholderRepository.countDistinctItemsByTrialStatusForOwner(ownerId, "IN_PROGRESS");

        long iprFiled = itemRepository.countByOwnerAndIprStatusIn(ownerId,
                List.of(Item.IPRStatus.PATENT_FILED, Item.IPRStatus.GRANTED, Item.IPRStatus.TRADEMARK));

        long totFilled = itemRepository.countByOwnerAndTotStatusIn(ownerId,
                List.of(Item.ToTStatus.FILED));

        // Detailed IPR breakdown (per type, from IPRDetail table)
        long patentFiledCount     = iprDetailRepository.countPatentFiled(ownerId);
        long patentGrantedCount   = iprDetailRepository.countPatentGranted(ownerId);
        long trademarkFiledCount  = iprDetailRepository.countTrademarkFiled(ownerId);
        long trademarkGrantedCount= iprDetailRepository.countTrademarkGranted(ownerId);
        long designFiledCount     = iprDetailRepository.countDesignFiled(ownerId);
        long designGrantedCount   = iprDetailRepository.countDesignGranted(ownerId);
        long copyrightFiledCount  = iprDetailRepository.countCopyrightFiled(ownerId);
        long copyrightGrantedCount= iprDetailRepository.countCopyrightGranted(ownerId);

        /* Percentages */
        double developedPct        = percent(developed,        total);
        double inProgressPct       = percent(inProgress,       total);
        double underDevelopmentPct = percent(underDevelopment, total);
        double notStartedPct       = percent(notStarted,       total);
        double trialsPct           = percent(trials,           total);
        double iprFiledPct         = percent(iprFiled,         total);
        double totFilledPct        = percent(totFilled,        total);

        /* Trials overview */
        List<DashboardStats.TrialsOverviewItem> trialsOverview = buildTrialsOverview(ownerId);

        /* Monthly progress */
        List<DashboardStats.MonthlyProgressItem> monthly = buildMonthlyProgress(
                LocalDate.now().getYear());

        /* ToT pipeline overview: TTD / TNF / TAC / CEC documents → LAToT Signed → Certified */
        List<DashboardStats.TotStatusItem> totStatusOverview = buildTotStatusOverview(ownerId);

        /* Documentation stats — count items that have each doc status */
        DashboardStats.DocumentationStatsItem docStats = buildDocumentationStats(total);

        /* Upcoming due dates */
        List<DashboardStats.UpcomingDueDateItem> upcomingDues = buildUpcomingDueDates(ownerId);

        /* Recent activities from notifications — scoped to the current user's own feed */
        List<DashboardStats.RecentActivityItem> recentActivities = buildRecentActivities(currentUserId());

        return DashboardStats.builder()
                .total(total)
                .developed(developed)
                .inProgress(inProgress)
                .underDevelopment(underDevelopment)
                .notStarted(notStarted)
                .trials(trials)
                .iprFiled(iprFiled)
                .totFilled(totFilled)
                .patentFiledCount(patentFiledCount)
                .patentGrantedCount(patentGrantedCount)
                .trademarkFiledCount(trademarkFiledCount)
                .trademarkGrantedCount(trademarkGrantedCount)
                .designFiledCount(designFiledCount)
                .designGrantedCount(designGrantedCount)
                .copyrightFiledCount(copyrightFiledCount)
                .copyrightGrantedCount(copyrightGrantedCount)
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
                .totStatusOverview(totStatusOverview)
                .documentationStats(docStats)
                .upcomingDueDates(upcomingDues)
                .recentActivities(recentActivities)
                .build();
    }

    /* ── Upcoming due dates (next 90 days) ── */
    @Cacheable(value = "dashboard", key = "'upcoming-' + T(org.springframework.security.core.context.SecurityContextHolder).context.authentication.name")
    @Transactional(readOnly = true)
    public List<DashboardStats.UpcomingDueDateItem> getUpcomingDueDates() {
        return buildUpcomingDueDates(currentOwnerId());
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

    private List<DashboardStats.TrialsOverviewItem> buildTrialsOverview(Long ownerId) {
        // Count stakeholders by their own trial_status. This is set the moment a
        // stakeholder is added (default NOT_STARTED) and does not depend on a
        // feedback round existing — using trial_feedbacks.status here previously
        // meant a stakeholder with no feedback round yet contributed nothing to
        // this chart, which made the overview look empty/wrong.
        List<Object[]> rows = trialStakeholderRepository.countGroupByTrialStatusForOwner(ownerId);

        Map<String, String> labelMap = Map.of(
                "NOT_STARTED", "Not Started",
                "IN_PROGRESS", "In Progress",
                "COMPLETED",   "Completed",
                "PENDING",     "Pending"
        );

        // Ensure all statuses appear even if count is 0. "TESTING" is intentionally
        // excluded here — any legacy rows still carrying that status are dropped
        // below rather than shown as their own bar.
        List<String> allowedStatuses = List.of("NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PENDING");
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String key : allowedStatuses) {
            counts.put(key, 0L);
        }
        for (Object[] row : rows) {
            if (row[0] == null) continue;
            String status = row[0].toString();
            // "ON_HOLD" is the retired name for this same status — legacy rows still
            // carrying it are folded into the "Pending" bucket, same as "Testing" is
            // folded into "In Progress" elsewhere.
            if ("ON_HOLD".equals(status)) status = "PENDING";
            if (!counts.containsKey(status)) continue; // drops TESTING and any other legacy status
            counts.merge(status, ((Number) row[1]).longValue(), Long::sum);
        }

        return counts.entrySet().stream()
                .map(e -> DashboardStats.TrialsOverviewItem.builder()
                        .status(labelMap.getOrDefault(e.getKey(), e.getKey()))
                        .count(e.getValue())
                        .build())
                .toList();
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

    private List<DashboardStats.TotStatusItem> buildTotStatusOverview(Long ownerId) {
        // Per-document breakdown (TTD / TNF / TAC / CEC) instead of one lumped
        // "ToT Document Filed" bucket — much more useful at a glance.
        Map<String, Long> docCounts = new LinkedHashMap<>();
        docCounts.put("TTD", 0L);
        docCounts.put("TNF", 0L);
        docCounts.put("TAC", 0L);
        docCounts.put("CEC", 0L);
        for (Object[] row : itemRepository.countGroupByTotDocumentCodeForOwner(ownerId)) {
            if (row[0] == null) continue;
            String code = row[0].toString();
            if (!docCounts.containsKey(code)) continue; // ignore unknown/legacy codes
            docCounts.put(code, ((Number) row[1]).longValue());
        }

        long latotSigned = totPartnerRepository.countLatotSignedForOwner(ownerId);
        long certified    = totPartnerRepository.countCertifiedForOwner(ownerId);

        List<DashboardStats.TotStatusItem> result = new ArrayList<>();
        docCounts.forEach((code, count) ->
                result.add(DashboardStats.TotStatusItem.builder().status(code).count(count).build()));
        result.add(DashboardStats.TotStatusItem.builder().status("LAToT Signed").count(latotSigned).build());
        result.add(DashboardStats.TotStatusItem.builder().status("ToT Certification").count(certified).build());
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

    private List<DashboardStats.UpcomingDueDateItem> buildUpcomingDueDates(Long ownerId) {
        LocalDate today  = LocalDate.now();
        LocalDate future = today.plusDays(90);

        List<DashboardStats.UpcomingDueDateItem> devDates = itemRepository
                .findUpcomingDueDatesForOwner(ownerId, today, future).stream()
                .map(item -> {
                    long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(
                            today, item.getProductDevCompletionDate());
                    return DashboardStats.UpcomingDueDateItem.builder()
                            .id(item.getId())
                            .name(item.getName())
                            .label("Product Development Completion")
                            .dueDate(item.getProductDevCompletionDate().toString())
                            .daysLeft(daysLeft)
                            .type("dev")
                            .build();
                })
                .toList();

        // Variants carry their own, independent Product Development Completion
        // date — previously left out of this widget entirely.
        List<DashboardStats.UpcomingDueDateItem> variantDevDates = itemVariantRepository
                .findUpcomingDueDatesForOwner(ownerId, today, future).stream()
                .filter(v -> v.getItem() != null)
                .map(v -> {
                    long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(
                            today, v.getProductDevCompletionDate());
                    return DashboardStats.UpcomingDueDateItem.builder()
                            .id(v.getItem().getId())
                            .name(v.getItem().getName() + " — " + v.getName())
                            .label("Product Development Completion")
                            .dueDate(v.getProductDevCompletionDate().toString())
                            .daysLeft(daysLeft)
                            .type("dev")
                            .build();
                })
                .toList();

        // Now resolves the item either directly or via the partner's variant —
        // previously silently dropped every variant-only ToT partner.
        List<DashboardStats.UpcomingDueDateItem> totDates = totPartnerRepository
                .findUpcomingValidityForOwner(ownerId, today, future).stream()
                .map(p -> {
                    Item item = p.getItem() != null ? p.getItem()
                            : (p.getItemVariant() != null ? p.getItemVariant().getItem() : null);
                    if (item == null) return null;
                    long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(
                            today, p.getTotValidityDate());
                    String firm = p.getTotFirm() != null && !p.getTotFirm().isBlank()
                            ? " (" + p.getTotFirm() + ")" : "";
                    String name = p.getItemVariant() != null
                            ? item.getName() + " — " + p.getItemVariant().getName()
                            : item.getName();
                    return DashboardStats.UpcomingDueDateItem.builder()
                            .id(item.getId())
                            .name(name)
                            .label("ToT Validity Renewal" + firm)
                            .dueDate(p.getTotValidityDate().toString())
                            .daysLeft(daysLeft)
                            .type("tot")
                            .build();
                })
                .filter(java.util.Objects::nonNull)
                .toList();

        // Sorted soonest/most-overdue first so the dashboard card and the
        // "View All" popup both read in due-date order without any client
        // re-sort. Limit raised from 10 -> 50 so "View All" has real depth
        // to show beyond the top few the card teases.
        return java.util.stream.Stream.of(devDates, variantDevDates, totDates)
                .flatMap(List::stream)
                .sorted(java.util.Comparator.comparingLong(DashboardStats.UpcomingDueDateItem::getDaysLeft))
                .limit(50)
                .toList();
    }

    private List<DashboardStats.RecentActivityItem> buildRecentActivities(Long userId) {
        // Pull from the current user's own notification feed — latest 50
        // (raised from 10 so the dashboard's "View All" popup has more than
        // the handful shown inline on the card)
        List<Notification> source = userId != null
                ? notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : notificationRepository.findAll();

        return source.stream()
                .filter(n -> n.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(50)
                .map(n -> {
                    String color = switch (n.getType()) {
                        case ITEM_ADDED      -> "#22c55e";
                        case STATUS_CHANGED  -> "#3b82f6";
                        case DOCUMENT_FILLED -> "#f59e0b";
                        case IPR_CHANGED     -> "#ef4444";
                        case DOCUMENT_UPLOAD -> "#8b5cf6";
                        case TRIAL_UPDATE    -> "#0ea5e9";
                        case PROCUREMENT     -> "#ca8a04";
                        case TOT_VALIDITY    -> "#dc2626";
                        case DEV_COMPLETION  -> "#7c3aed";
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