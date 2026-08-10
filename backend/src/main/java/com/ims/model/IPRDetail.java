package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ipr_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IPRDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ── Patent ── */
    private Boolean patentFiled;
    private Boolean patentGranted;
    @Column(length = 200)
    private String patentInventor;
    @Column(name = "patent_filing_no", length = 100)
    private String patentFilingNo;
    @Column(name = "patent_filing_date")
    private LocalDate patentFilingDate;
    @Column(name = "patent_grant_no", length = 100)
    private String patentGrantNo;
    @Column(name = "patent_grant_date")
    private LocalDate patentGrantDate;

    /* ── Trademark ── */
    private Boolean trademarkFiled;
    private Boolean trademarkGranted;
    @Column(length = 200)
    private String trademarkInventor;
    @Column(name = "trademark_filing_no", length = 100)
    private String trademarkFilingNo;
    @Column(name = "trademark_filing_date")
    private LocalDate trademarkFilingDate;
    @Column(name = "trademark_grant_no", length = 100)
    private String trademarkGrantNo;
    @Column(name = "trademark_grant_date")
    private LocalDate trademarkGrantDate;

    /* ── Design ── */
    private Boolean designFiled;
    private Boolean designGranted;
    @Column(length = 200)
    private String designInventor;
    @Column(name = "design_filing_no", length = 100)
    private String designFilingNo;
    @Column(name = "design_filing_date")
    private LocalDate designFilingDate;
    @Column(name = "design_grant_no", length = 100)
    private String designGrantNo;
    @Column(name = "design_grant_date")
    private LocalDate designGrantDate;

    /* ── Copyright ── */
    private Boolean copyrightFiled;
    private Boolean copyrightGranted;
    @Column(length = 200)
    private String copyrightInventor;
    @Column(name = "copyright_filing_no", length = 100)
    private String copyrightFilingNo;
    @Column(name = "copyright_filing_date")
    private LocalDate copyrightFilingDate;
    @Column(name = "copyright_grant_no", length = 100)
    private String copyrightGrantNo;
    @Column(name = "copyright_grant_date")
    private LocalDate copyrightGrantDate;

    @OneToOne
    @JoinColumn(name = "item_id")
    private Item item;

    /* Set when this IPR record belongs to a specific variant instead of the
     * base item directly — exactly one of item/itemVariant is non-null. */
    @OneToOne
    @JoinColumn(name = "variant_id")
    private ItemVariant itemVariant;
}
