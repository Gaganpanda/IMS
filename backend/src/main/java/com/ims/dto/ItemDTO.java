package com.ims.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ItemDTO {

    /* ─────────────────────────── Request ─────────────────────────── */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {

        private List<ToTPartnerDTO> totPartners;

        private IPRDetailDTO iprDetail;

        private List<ProcurementDetailDTO> procurementDetails;

        @Builder.Default
        private List<ItemVariantDTO> variants = new ArrayList<>();

        @NotBlank(message = "Item name is required")
        @Size(max = 200)
        private String name;

        private String category;

        @NotBlank(message = "Description is required")
        private String description;

        /* Name of the inventor of this item */
        @Size(max = 200)
        private String inventor;

        private LocalDate productDevCompletionDate;

        /* Development */
        private String developmentStatus;
        private LocalDate developmentDate;

        @Size(max = 200)
        private String remarks;

        /* ToT */
        private String totStatus;

        @Size(max = 100)
        private String totDocumentNo;
        private LocalDate filledDate;

        @Builder.Default
        private List<String> totDocumentsFiled = new ArrayList<>();

        /* Trials */
        private String trialsStatus;
        private LocalDate sampleRequestDate;
        private LocalDate sampleSubmissionDate;

        @Builder.Default
        private List<TrialStakeholderDTO> trialStakeholders = new ArrayList<>();

        /* IPR */
        private String iprStatus;

        /* Documentation */
        @Builder.Default
        private List<String> documentation = new ArrayList<>();

        /* Procurement */
        private Integer crbfCount;
        private Integer ssbCount;

        /* Key Info */
        private String weight;
        private String size;
        private String material;
        private String color;
        private Double unitCost;
        private String vendor;
        private String warranty;
    }

    /* ─────────────────────────── Response ────────────────────────── */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long   id;
        private String name;
        private String category;
        private String description;
        private String inventor;
        private String imageUrl;
        private LocalDate productDevCompletionDate;

        private String developmentStatus;
        private LocalDate developmentDate;
        private String remarks;

        private String totStatus;
        private String totDocumentNo;
        private LocalDate filledDate;
        private List<String> totDocumentsFiled;

        private String trialsStatus;
        private LocalDate sampleRequestDate;
        private LocalDate sampleSubmissionDate;
        private List<TrialStakeholderDTO> trialStakeholders;

        private String iprStatus;
        private String iprStatusLabel;

        private List<String> documentation;
        private List<ItemDocumentDTO> uploadedDocuments;

        private List<ItemVariantDTO> variants;
        /** True once this item has been converted to use variants — the item
         *  then acts only as a container and its own scalar detail fields
         *  should no longer be edited/displayed; each variant is independent. */
        private boolean hasVariants;

        private Integer crbfCount;
        private Integer ssbCount;

        private String weight;
        private String size;
        private String material;
        private String color;
        private Double unitCost;
        private String vendor;
        private String warranty;

        private String createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private List<ToTPartnerDTO> totPartners;

        private List<ProcurementDetailDTO> procurementDetails;

        private IPRDetailDTO iprDetail;
    }

    /* ─────────────────────────── Summary ─────────────────────────── */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private Long   id;
        private String name;
        private String category;
        private String description;
        private String imageUrl;
        private String inventor;
        private String developmentStatus;
        private String totStatus;
        private String iprStatus;
        private String iprStatusLabel;
        private String trialsStatus;
        @Builder.Default
        private List<String> trialStakeholderNames = new ArrayList<>();
        @Builder.Default
        private List<ItemVariantDTO> variants = new ArrayList<>();
        private boolean hasVariants;
        private LocalDateTime updatedAt;
    }
}
