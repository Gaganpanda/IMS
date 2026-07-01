package com.ims.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialStakeholderDTO {

    private Long id;

    private String stakeholderName;

    private LocalDate sampleRequestDate;

    private LocalDate sampleSubmissionDate;

    private String feedback;

    private String correction;

    private String furtherAction;

    private String status;
}