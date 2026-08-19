package com.ims.repository;

import com.ims.model.ItemVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemVariantRepository extends JpaRepository<ItemVariant, Long> {
    List<ItemVariant> findByItemId(Long itemId);

    /* Variants with a Product Development Completion date set — used by the
     * daily reminder scan (needs every record) and by the owner-scoped
     * upcoming-due-dates widget. */
    @Query("""
            SELECT v FROM ItemVariant v
            WHERE v.productDevCompletionDate IS NOT NULL
            """)
    List<ItemVariant> findAllWithProductDevCompletionDate();

    @Query("""
            SELECT v FROM ItemVariant v
            LEFT JOIN v.item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
              AND v.productDevCompletionDate IS NOT NULL
              AND v.productDevCompletionDate BETWEEN :today AND :future
            ORDER BY v.productDevCompletionDate ASC
            """)
    List<ItemVariant> findUpcomingDueDatesForOwner(
            @Param("ownerId") Long ownerId,
            @Param("today") LocalDate today,
            @Param("future") LocalDate future);
}
