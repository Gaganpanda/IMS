package com.ims.repository;

import com.ims.model.TrialStakeholder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrialStakeholderRepository
        extends JpaRepository<TrialStakeholder, Long> {

    List<TrialStakeholder> findByItemId(Long itemId);
}