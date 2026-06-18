package com.ims.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToTPartnerDTO {

    private Long id;

    private String partnerName;

    private Boolean totCertificate;

    private Boolean sampleSubmittedForTac;

    private Boolean latotSignature;
}