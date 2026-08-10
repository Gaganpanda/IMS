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

    private String procurementAgency;

    private String totFirmNo;

    private Integer noOfItemProcured;

    private String productionValue;

    private String orderNumber;

    private LocalDate orderDate;
}