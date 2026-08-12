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

    @Query("""
            SELECT p FROM ToTPartner p
            WHERE (:ownerId IS NULL OR p.item.createdBy.id = :ownerId)
              AND p.totValidityDate IS NOT NULL
              AND p.totValidityDate BETWEEN :today AND :future
            ORDER BY p.totValidityDate ASC
            """)
    List<ToTPartner> findUpcomingValidityForOwner(
            @Param("ownerId") Long ownerId,
            @Param("today") LocalDate today,
            @Param("future") LocalDate future);
}