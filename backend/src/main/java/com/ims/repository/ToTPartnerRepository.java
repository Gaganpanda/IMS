package com.ims.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ims.model.ToTPartner;

public interface ToTPartnerRepository
        extends JpaRepository<ToTPartner, Long> {

    List<ToTPartner> findByItemId(Long itemId);

    List<ToTPartner> findByItemVariantId(Long variantId);

    /* Owner check covers BOTH shapes of a ToT partner row: attached directly
     * to an Item, or attached to an ItemVariant (whose own item carries the
     * owner). Exactly one of p.item / p.itemVariant is non-null, so using a
     * LEFT JOIN + OR here (rather than a plain p.item.createdBy.id path,
     * which silently drops every variant-only row) is required — otherwise
     * ToT partners recorded against a variant never surface in reminders. */
    @Query("""
            SELECT p FROM ToTPartner p
            LEFT JOIN p.item i
            LEFT JOIN p.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
              AND p.totValidityDate IS NOT NULL
              AND p.totValidityDate BETWEEN :today AND :future
            ORDER BY p.totValidityDate ASC
            """)
    List<ToTPartner> findUpcomingValidityForOwner(
            @Param("ownerId") Long ownerId,
            @Param("today") LocalDate today,
            @Param("future") LocalDate future);

    /* LAToT Signing Date recorded — agreement has been signed */
    @Query("""
            SELECT COUNT(p) FROM ToTPartner p
            LEFT JOIN p.item i
            LEFT JOIN p.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
              AND p.latotSigningDate IS NOT NULL
            """)
    long countLatotSignedForOwner(@Param("ownerId") Long ownerId);

    /* ToT Certificate Date recorded — certification received */
    @Query("""
            SELECT COUNT(p) FROM ToTPartner p
            LEFT JOIN p.item i
            LEFT JOIN p.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
              AND p.totCertificateDate IS NOT NULL
            """)
    long countCertifiedForOwner(@Param("ownerId") Long ownerId);

    /* All ToT partners with a validity date set, regardless of owner —
     * used by the daily reminder scan which needs every record, not a
     * single owner's slice. */
    @Query("""
            SELECT p FROM ToTPartner p
            WHERE p.totValidityDate IS NOT NULL
            """)
    List<ToTPartner> findAllWithValidityDate();
}