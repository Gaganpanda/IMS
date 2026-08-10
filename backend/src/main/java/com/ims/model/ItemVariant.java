package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "item_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    /* Variant code, e.g. "ECWSB-2.5L" */
    @Column(length = 100)
    private String code;

    @Column(length = 100)
    private String category;

    @Column(length = 500)
    private String description;

    @Column(length = 200)
    private String inventor;

    @Column(name = "product_dev_completion_date")
    private java.time.LocalDate productDevCompletionDate;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /* ── Development ── */
    @Enumerated(EnumType.STRING)
    @Column(name = "development_status", length = 30)
    private Item.DevelopmentStatus developmentStatus;

    @Column(name = "development_date")
    private java.time.LocalDate developmentDate;

    @Column(length = 200)
    private String remarks;

    /* ── ToT ── */
    @Enumerated(EnumType.STRING)
    @Column(name = "tot_status", length = 30)
    private Item.ToTStatus totStatus;

    @Column(name = "tot_document_no", length = 100)
    private String totDocumentNo;

    @Column(name = "filled_date")
    private java.time.LocalDate filledDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "variant_tot_documents",
            joinColumns = @JoinColumn(name = "variant_id"))
    @Column(name = "document_code", length = 20)
    @Builder.Default
    private List<String> totDocumentsFiled = new ArrayList<>();

    @OneToMany(mappedBy = "itemVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ToTPartner> totPartners = new ArrayList<>();

    /* ── Trials ── */
    @Enumerated(EnumType.STRING)
    @Column(name = "trials_status", length = 30)
    private Item.TrialsStatus trialsStatus;

    @Column(name = "sample_request_date")
    private java.time.LocalDate sampleRequestDate;

    @Column(name = "sample_submission_date")
    private java.time.LocalDate sampleSubmissionDate;

    @OneToMany(mappedBy = "itemVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TrialStakeholder> trialStakeholders = new ArrayList<>();

    /* ── IPR ── */
    @Enumerated(EnumType.STRING)
    @Column(name = "ipr_status", length = 30)
    private Item.IPRStatus iprStatus;

    @Column(name = "ipr_types_label", length = 200)
    private String iprTypesLabel;

    @OneToOne(mappedBy = "itemVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    private IPRDetail iprDetail;

    /* ── Documentation ── */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "variant_documentation",
            joinColumns = @JoinColumn(name = "variant_id"))
    @Column(name = "doc_name", length = 200)
    @Builder.Default
    private List<String> documentation = new ArrayList<>();

    @OneToMany(mappedBy = "itemVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemDocument> uploadedDocuments = new ArrayList<>();

    /* ── Procurement ── */
    @Column(name = "crbf_count")
    private Integer crbfCount;

    @Column(name = "ssb_count")
    private Integer ssbCount;

    @OneToMany(mappedBy = "itemVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProcurementDetail> procurementDetails = new ArrayList<>();

    /* ── Key Information ── */
    @Column(length = 50)
    private String weight;

    @Column(length = 50)
    private String size;

    @Column(length = 200)
    private String material;

    @Column(length = 50)
    private String color;

    @Column(name = "unit_cost")
    private Double unitCost;

    @Column(length = 200)
    private String vendor;

    @Column(length = 100)
    private String warranty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
}
