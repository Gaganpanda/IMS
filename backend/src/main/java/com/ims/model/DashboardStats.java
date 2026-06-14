package com.ims.model;

import lombok.*;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats implements Serializable {

    /* ── Top-level counters ── */
    private long total;
    private long developed;
    private long inProgress;
    private long underDevelopment;
    private long notStarted;
    private long trials;
    private long iprFiled;
    private long totFilled;
    private long totalDocuments;

    /* ── Percentage breakdowns ── */
    private double developedPct;
    private double inProgressPct;
    private double underDevelopmentPct;
    private double notStartedPct;
    private double trialsPct;
    private double iprFiledPct;
    private double totFilledPct;

    /* ── Charts ── */
    private List<TrialsOverviewItem>  trialsOverview;
    private List<MonthlyProgressItem> monthlyProgress;
    private DocumentationStatsItem    documentationStats;

    /* ── Widgets ── */
    private List<UpcomingDueDateItem>  upcomingDueDates;
    private List<RecentActivityItem>   recentActivities;

    /* ── Inner types ── */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TrialsOverviewItem implements Serializable {
        private String status;
        private long   count;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyProgressItem implements Serializable {
        private String month;
        private long   count;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DocumentationStatsItem implements Serializable {
        private long completed;
        private long inProgress;
        private long pending;
        private long toBeUploaded;
        private long total;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpcomingDueDateItem implements Serializable {
        private Long   id;
        private String name;
        private String label;
        private String dueDate;
        private long   daysLeft;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentActivityItem implements Serializable {
        private String type;
        private String message;
        private String color;
        private String createdAt;
    }
}
