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

        /* Version of the item this request was built from. Sent by the client
         * on every update so the server can detect if someone else saved the
         * item in the meantime (see Item#version). Null/absent on create,
         * where there's nothing to conflict with. */
        private Long version;

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
        /* Current optimistic-locking version. The edit form must echo this
         * back unchanged in Request#version on save. */
        private Long   version;
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

        /** True when any trial-feedback round on this item or any of its
         *  variants is currently overdue (7+ days since sample submission with
         *  no feedback received). Drives the ⚠ warning icon. */
        private boolean hasOverdueFeedback;

        /** True when a ToT partner's validity date (on this item or any
         *  variant) has expired with no renewal recorded yet. Drives the
         *  ⚠ warning icon. */
        private boolean hasOverdueTot;

        /** Human-readable reason for the ToT-overdue warning (hover tooltip). */
        private String totOverdueMessage;

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
        private boolean hasOverdueFeedback;
        /** True when a ToT partner's validity date (item or any variant) has
         *  expired with no renewal recorded — drives the ⚠ warning icon. */
        private boolean hasOverdueTot;
        private LocalDateTime updatedAt;
    }
}
