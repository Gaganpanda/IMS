package com.ims.repository;

import com.ims.model.IPRDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IPRDetailRepository
        extends JpaRepository<IPRDetail, Long> {

    Optional<IPRDetail> findByItemId(Long itemId);
}
