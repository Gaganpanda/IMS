package com.ims.repository;

import com.ims.model.ToTPartner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ToTPartnerRepository
        extends JpaRepository<ToTPartner, Long> {

    List<ToTPartner> findByItemId(Long itemId);
}