package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "trial_stakeholders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialStakeholder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stakeholderName;

    private LocalDate sampleRequestDate;

    private LocalDate sampleSubmissionDate;

    private String feedback;

    private String correction;

    private String furtherAction;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;
}