package com.ims.repository;

import com.ims.model.TrialFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrialFeedbackRepository extends JpaRepository<TrialFeedback, Long> {

    List<TrialFeedback> findByTrialStakeholderId(Long stakeholderId);

    /** Every feedback round that has a sample submitted but no feedback
     *  received yet — candidates for the overdue-reminder scan. */
    List<TrialFeedback> findBySampleSubmissionDateIsNotNullAndFeedbackReceivedDateIsNull();

    /**
     * Count feedback rounds grouped by status.
     * When ownerId is non-null, only rounds belonging to that user's items are counted.
     */
    @Query("""
        SELECT tf.status, COUNT(tf)
        FROM TrialFeedback tf
        LEFT JOIN tf.trialStakeholder ts
        LEFT JOIN ts.item i1
        LEFT JOIN i1.createdBy cb1
        LEFT JOIN ts.itemVariant v
        LEFT JOIN v.item i2
        LEFT JOIN i2.createdBy cb2
        WHERE (:ownerId IS NULL OR cb1.id = :ownerId OR cb2.id = :ownerId)
        GROUP BY tf.status
        """)
    List<Object[]> countGroupByStatusForOwner(@Param("ownerId") Long ownerId);
}
