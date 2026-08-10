package com.ims.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToTPartnerDTO {

    private Long id;

    private String totFirm;

    private LocalDate latotSigningDate;

    private LocalDate sampleSubmissionForTechAbsorptionDate;

    private LocalDate totCertificateDate;

    private LocalDate totValidityDate;
}
