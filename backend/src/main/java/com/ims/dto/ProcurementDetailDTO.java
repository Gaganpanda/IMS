package com.ims.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcurementDetailDTO {

    private Long id;

    private String organisationName;

    private Integer itemsProcured;

    private String orderNumber;

    private LocalDate orderDate;
}