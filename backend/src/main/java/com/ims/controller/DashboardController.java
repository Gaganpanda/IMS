package com.ims.controller;

import com.ims.dto.ApiResponse;
import com.ims.model.DashboardStats;
import com.ims.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard statistics and chart data (Redis cached)")
public class DashboardController {

    private final DashboardService dashboardService;

    /* ── Full stats (Redis cached 120 s) ── */
    @GetMapping("/stats")
    @Operation(summary = "Full dashboard stats — cached in Redis")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardStats()));
    }

    /* ── Upcoming due dates ── */
    @GetMapping("/upcoming-due-dates")
    @Operation(summary = "Items due in the next 90 days")
    public ResponseEntity<ApiResponse<List<DashboardStats.UpcomingDueDateItem>>> getUpcomingDueDates() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getUpcomingDueDates()));
    }

    /* ── Monthly progress ── */
    @GetMapping("/monthly-progress")
    @Operation(summary = "Monthly item creation counts for a given year")
    public ResponseEntity<ApiResponse<List<DashboardStats.MonthlyProgressItem>>> getMonthlyProgress(
            @RequestParam(defaultValue = "0") int year) {
        if (year == 0) year = LocalDate.now().getYear();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMonthlyProgress(year)));
    }

    /* ── Trials overview ── */
    @GetMapping("/trials-overview")
    @Operation(summary = "Trials grouped by status")
    public ResponseEntity<ApiResponse<List<DashboardStats.TrialsOverviewItem>>> getTrialsOverview() {
        DashboardStats stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats.getTrialsOverview()));
    }

    /* ── Documentation stats ── */
    @GetMapping("/documentation-stats")
    @Operation(summary = "Documentation completion stats")
    public ResponseEntity<ApiResponse<DashboardStats.DocumentationStatsItem>> getDocumentationStats() {
        DashboardStats stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats.getDocumentationStats()));
    }

    /* ── Recent activities ── */
    @GetMapping("/recent-activities")
    @Operation(summary = "Recent system activities")
    public ResponseEntity<ApiResponse<List<DashboardStats.RecentActivityItem>>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        DashboardStats stats = dashboardService.getDashboardStats();
        List<DashboardStats.RecentActivityItem> activities = stats.getRecentActivities()
                .stream().limit(limit).toList();
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
