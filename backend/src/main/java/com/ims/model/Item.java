    package com.ims.model;

    import jakarta.persistence.*;
    import jakarta.validation.constraints.NotBlank;
    import lombok.*;
    import com.ims.model.TrialStakeholder;
    import java.time.LocalDate;
    import java.time.LocalDateTime;
    import java.util.ArrayList;
    import java.util.List;

    @Entity
    @Table(name = "items", indexes = {
            @Index(name = "idx_item_code",   columnList = "code",   unique = true),
            @Index(name = "idx_item_category", columnList = "category"),
            @Index(name = "idx_item_dev_status", columnList = "development_status"),
            @Index(name = "idx_item_updated", columnList = "updated_at")
    })
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Item {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        /* ── Basic Information ── */
        @NotBlank
        @Column(nullable = false, length = 200)
        private String name;

        @NotBlank
        @Column(nullable = false, unique = true, length = 50)
        private String code;

        @Column(length = 100)
        private String category;

        @Column(columnDefinition = "TEXT")
        private String description;

        @Enumerated(EnumType.STRING)
        @Column(length = 20)
        private Priority priority;

        @Column(name = "expected_completion_date")
        private LocalDate expectedCompletionDate;

        @Column(name = "image_url", length = 500)
        private String imageUrl;

        /* ── Development ── */
        @Enumerated(EnumType.STRING)
        @Column(name = "development_status", length = 30)
        private DevelopmentStatus developmentStatus;

        @Column(name = "development_date")
        private LocalDate developmentDate;

        @Column(length = 200)
        private String remarks;

        /* ── ToT ── */
        @Enumerated(EnumType.STRING)
        @Column(name = "tot_status", length = 30)
        private ToTStatus totStatus;

        @Column(name = "tot_document_no", length = 100)
        private String totDocumentNo;

        @Column(name = "filled_date")
        private LocalDate filledDate;

        /* ── Trials ── */
        @Enumerated(EnumType.STRING)
        @Column(name = "trials_status", length = 30)
        private TrialsStatus trialsStatus;

        @Column(name = "sample_request_date")
        private LocalDate sampleRequestDate;

        @Column(name = "sample_submission_date")
        private LocalDate sampleSubmissionDate;

        @OneToMany(
            mappedBy = "item",
            cascade = CascadeType.ALL,
            orphanRemoval = true
        )
        @Builder.Default
        private List<TrialStakeholder> trialStakeholders = new ArrayList<>();

        /* ── IPR ── */
        @Enumerated(EnumType.STRING)
        @Column(name = "ipr_status", length = 30)
        private IPRStatus iprStatus;

        @Column(name = "patent_number", length = 100)
        private String patentNumber;

        @Column(name = "filing_date")
        private LocalDate filingDate;

        /* ── Documentation ── */
        @ElementCollection(fetch = FetchType.EAGER)
        @CollectionTable(name = "item_documentation",
                joinColumns = @JoinColumn(name = "item_id"))
        @Column(name = "doc_name", length = 200)
        @Builder.Default
        private List<String> documentation = new ArrayList<>();

        /* ── Procurement ── */
        @Column(name = "crbf_count")
        private Integer crbfCount;

        @Column(name = "ssb_count")
        private Integer ssbCount;

        /* ── Key Information (optional extra fields) ── */
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

        /* ── Audit ── */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "created_by_id")
        private User createdBy;

        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;

        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        @OneToMany(
                mappedBy = "item",
                cascade = CascadeType.ALL,
                orphanRemoval = true
        )
        @Builder.Default
        private List<ToTPartner> totPartners = new ArrayList<>();

        @OneToMany(
                mappedBy = "item",
                cascade = CascadeType.ALL,
                orphanRemoval = true
        )
        @Builder.Default
        private List<ProcurementDetail> procurementDetails = new ArrayList<>();

        @OneToOne(
                mappedBy = "item",
                cascade = CascadeType.ALL,
                orphanRemoval = true
        )
        private IPRDetail iprDetail;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
            updatedAt = LocalDateTime.now();
        }

        @PreUpdate
        protected void onUpdate() {
            updatedAt = LocalDateTime.now();
        }

        /* ── Enums ── */
        public enum DevelopmentStatus {
            DEVELOPED, IN_PROGRESS, UNDER_DEVELOPMENT, NOT_STARTED;

            @com.fasterxml.jackson.annotation.JsonCreator
            public static DevelopmentStatus fromString(String value) {
                if (value == null) return null;
                return switch (value.trim()) {
                    case "Developed"         -> DEVELOPED;
                    case "In Progress"       -> IN_PROGRESS;
                    case "Under Development" -> UNDER_DEVELOPMENT;
                    case "Not Started"       -> NOT_STARTED;
                    default -> {
                        try { yield valueOf(value.toUpperCase().replace(" ","_")); }
                        catch (Exception e) { yield null; }
                    }
                };
            }
        }

        public enum ToTStatus {
            FILLED_TNF, FILLED_TAC, TO_BE_FILLED, NOT_APPLICABLE;

            @com.fasterxml.jackson.annotation.JsonCreator
            public static ToTStatus fromString(String value) {
                if (value == null) return null;
                return switch (value.trim()) {
                    case "Filled (TnF)", "Filed", "Filed (TnF)" -> FILLED_TNF;
                    case "Filled (TAC)", "Filed (TAC)"           -> FILLED_TAC;
                    case "To Be Filled", "To Be Filed"           -> TO_BE_FILLED;
                    case "Not Applicable"                        -> NOT_APPLICABLE;
                    default -> {
                        try { yield valueOf(value.toUpperCase().replace(" ","_").replace("(","").replace(")","").replace("-","_")); }
                        catch (Exception e) { yield null; }
                    }
                };
            }
        }

        public enum IPRStatus {
            PATENT_FILED, GRANTED, TRADEMARK, UNDER_REVIEW, NOT_FILED;

            @com.fasterxml.jackson.annotation.JsonCreator
            public static IPRStatus fromString(String value) {
                if (value == null) return null;
                return switch (value.trim()) {
                    case "Patent Filed" -> PATENT_FILED;
                    case "Granted"      -> GRANTED;
                    case "Trademark"    -> TRADEMARK;
                    case "Under Review" -> UNDER_REVIEW;
                    case "Not Filed"    -> NOT_FILED;
                    default -> {
                        try { yield valueOf(value.toUpperCase().replace(" ","_")); }
                        catch (Exception e) { yield null; }
                    }
                };
            }
        }

        public enum TrialsStatus {
            PENDING, IN_PROGRESS, COMPLETED, ON_HOLD;

            @com.fasterxml.jackson.annotation.JsonCreator
            public static TrialsStatus fromString(String value) {
                if (value == null) return null;
                return switch (value.trim()) {
                    case "Pending"     -> PENDING;
                    case "In Progress" -> IN_PROGRESS;
                    case "Completed"   -> COMPLETED;
                    case "On Hold"     -> ON_HOLD;
                    default -> {
                        try { yield valueOf(value.toUpperCase().replace(" ","_")); }
                        catch (Exception e) { yield null; }
                    }
                };
            }
        }

        public enum Priority {
            HIGH, MEDIUM, LOW;

            @com.fasterxml.jackson.annotation.JsonCreator
            public static Priority fromString(String value) {
                if (value == null) return null;
                return switch (value.trim()) {
                    case "High"   -> HIGH;
                    case "Medium" -> MEDIUM;
                    case "Low"    -> LOW;
                    default -> {
                        try { yield valueOf(value.toUpperCase()); }
                        catch (Exception e) { yield null; }
                    }
                };
            }
        }
    }