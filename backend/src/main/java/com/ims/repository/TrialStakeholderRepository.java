package com.ims.repository;

import com.ims.model.TrialStakeholder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrialStakeholderRepository
        extends JpaRepository<TrialStakeholder, Long> {

    List<TrialStakeholder> findByItemId(Long itemId);

    /**
     * Count stakeholders grouped by their own status.
     * When ownerId is non-null only stakeholders belonging to that user's items are counted.
     */
    @Query("""
        SELECT ts.status, COUNT(ts)
        FROM TrialStakeholder ts
        WHERE (:ownerId IS NULL OR ts.item.createdBy.id = :ownerId)
        GROUP BY ts.status
        """)
    List<Object[]> countGroupByStatusForOwner(@Param("ownerId") Long ownerId);
}