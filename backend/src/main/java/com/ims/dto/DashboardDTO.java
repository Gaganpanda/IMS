package com.ims.dto;

import com.ims.model.DashboardStats;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private DashboardStats.DocumentationStatsItem documentationStats;
    private DashboardStats stats;
    // The full DashboardStats object already contains all needed fields.
    // This wrapper is here in case we want to extend with user-specific data later.
}
