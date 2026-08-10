package com.ims.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IPRDetailDTO {

    /* ── Patent ── */
    private Boolean patentFiled;
    private Boolean patentGranted;
    private String patentInventor;
    private String patentFilingNo;
    private LocalDate patentFilingDate;
    private String patentGrantNo;
    private LocalDate patentGrantDate;

    /* ── Trademark ── */
    private Boolean trademarkFiled;
    private Boolean trademarkGranted;
    private String trademarkInventor;
    private String trademarkFilingNo;
    private LocalDate trademarkFilingDate;
    private String trademarkGrantNo;
    private LocalDate trademarkGrantDate;

    /* ── Design ── */
    private Boolean designFiled;
    private Boolean designGranted;
    private String designInventor;
    private String designFilingNo;
    private LocalDate designFilingDate;
    private String designGrantNo;
    private LocalDate designGrantDate;

    /* ── Copyright ── */
    private Boolean copyrightFiled;
    private Boolean copyrightGranted;
    private String copyrightInventor;
    private String copyrightFilingNo;
    private LocalDate copyrightFilingDate;
    private String copyrightGrantNo;
    private LocalDate copyrightGrantDate;
}
