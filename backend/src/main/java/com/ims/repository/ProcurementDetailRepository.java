package com.ims.repository;

import com.ims.model.ProcurementDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcurementDetailRepository
        extends JpaRepository<ProcurementDetail, Long> {

    List<ProcurementDetail> findByItemId(Long itemId);
}
