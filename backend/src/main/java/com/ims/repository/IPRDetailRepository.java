package com.ims.repository;

import com.ims.model.IPRDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface IPRDetailRepository extends JpaRepository<IPRDetail, Long> {

    Optional<IPRDetail> findByItemId(Long itemId);

    Optional<IPRDetail> findByItemVariantId(Long variantId);

    /*
     * Owner-scoped counts for each IPR type/state.
     *
     * An IPRDetail row belongs to EITHER an item directly OR one of its
     * variants (see IPRDetail#item / #itemVariant — exactly one is set).
     * The previous version of these queries filtered with a plain
     * `d.item.createdBy.id = :ownerId` path expression, which JPQL compiles
     * to an implicit INNER join on d.item — silently dropping every
     * variant-only IPRDetail row from the FROM clause entirely, even when
     * :ownerId IS NULL (an admin viewing everyone's data). That meant any
     * IPR filed/granted only at the variant level (very common once an item
     * is converted to variants) was invisible to every one of these
     * dashboard counts. Explicit LEFT JOINs down both paths (direct item,
     * and item-via-variant) — the same fix already applied to
     * ToTPartnerRepository — fixes this for both owner-scoped and
     * admin ("see everything") views.
     */
    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.patentFiled = true
            """)
    long countPatentFiled(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.patentGranted = true
            """)
    long countPatentGranted(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.trademarkFiled = true
            """)
    long countTrademarkFiled(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.trademarkGranted = true
            """)
    long countTrademarkGranted(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.designFiled = true
            """)
    long countDesignFiled(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.designGranted = true
            """)
    long countDesignGranted(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.copyrightFiled = true
            """)
    long countCopyrightFiled(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(d) FROM IPRDetail d
            LEFT JOIN d.item i
            LEFT JOIN d.itemVariant v
            LEFT JOIN v.item vi
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId OR vi.createdBy.id = :ownerId)
            AND d.copyrightGranted = true
            """)
    long countCopyrightGranted(@Param("ownerId") Long ownerId);
}
