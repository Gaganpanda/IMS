package com.ims.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IPRDetailDTO {

    private Boolean patentFiled;
    private Boolean patentGranted;
    private String patentNumber;
    private String patentGrantedNumber;

    private Boolean trademarkFiled;
    private Boolean trademarkGranted;
    private String trademarkNumber;
    private String trademarkGrantedNumber;

    private Boolean designFiled;
    private Boolean designGranted;
    private String designNumber;
    private String designGrantedNumber;
}