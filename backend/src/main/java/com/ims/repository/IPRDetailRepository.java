package com.ims.repository;

import com.ims.model.IPRDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface IPRDetailRepository extends JpaRepository<IPRDetail, Long> {

    Optional<IPRDetail> findByItemId(Long itemId);

    Optional<IPRDetail> findByItemVariantId(Long variantId);

    /* Owner-scoped counts for each IPR type/state */
    @Query("SELECT COUNT(d) FROM IPRDetail d WHERE (:ownerId IS NULL OR d.item.createdBy.id = :ownerId) AND d.patentFiled    = true")
    long countPatentFiled   (@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(d) FROM IPRDetail d WHERE (:ownerId IS NULL OR d.item.createdBy.id = :ownerId) AND d.patentGranted  = true")
    long countPatentGranted (@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(d) FROM IPRDetail d WHERE (:ownerId IS NULL OR d.item.createdBy.id = :ownerId) AND d.trademarkFiled  = true")
    long countTrademarkFiled(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(d) FROM IPRDetail d WHERE (:ownerId IS NULL OR d.item.createdBy.id = :ownerId) AND d.trademarkGranted= true")
    long countTrademarkGranted(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(d) FROM IPRDetail d WHERE (:ownerId IS NULL OR d.item.createdBy.id = :ownerId) AND d.designFiled    = true")
    long countDesignFiled   (@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(d) FROM IPRDetail d WHERE (:ownerId IS NULL OR d.item.createdBy.id = :ownerId) AND d.designGranted  = true")
    long countDesignGranted (@Param("ownerId") Long ownerId);
}
