package com.ims.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ims.model.TrialStakeholder;

public interface TrialStakeholderRepository
        extends JpaRepository<TrialStakeholder, Long> {

    List<TrialStakeholder> findByItemId(Long itemId);

    List<TrialStakeholder> findByItemVariantId(Long variantId);

    /**
     * Count stakeholders grouped by status, for the dashboard's Trials
     * Status Overview chart.
     *
     * Native query, not JPQL: some databases still carry data in a legacy
     * "status" column (from before trial_status was introduced) that was
     * never backfilled into trial_status, so a stakeholder's real status can
     * currently live in either column. COALESCE(trial_status, status) reads
     * whichever one is actually populated for that row, so the chart is
     * correct regardless of which column a given row's data landed in.
     * TrialStakeholder itself only maps trial_status (the current column),
     * so this fallback has to be done in raw SQL rather than JPQL.
     */
    @Query(value = """
        SELECT COALESCE(ts.trial_status, ts.status) AS st, COUNT(*) AS cnt
        FROM trial_stakeholders ts
        LEFT JOIN items i1 ON ts.item_id = i1.id
        LEFT JOIN users cb1 ON i1.created_by_id = cb1.id
        LEFT JOIN item_variants v ON ts.variant_id = v.id
        LEFT JOIN items i2 ON v.item_id = i2.id
        LEFT JOIN users cb2 ON i2.created_by_id = cb2.id
        WHERE (:ownerId IS NULL OR cb1.id = :ownerId OR cb2.id = :ownerId)
        GROUP BY COALESCE(ts.trial_status, ts.status)
        """, nativeQuery = true)
    List<Object[]> countGroupByTrialStatusForOwner(@Param("ownerId") Long ownerId);
}