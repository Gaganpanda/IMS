package com.ims.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A variant is a fully independent record once an item has been converted to
 * use variants — its own Basic Info, ToT, IPR, Trial Stakeholders,
 * Documentation and Procurement data, completely separate from the parent
 * item and from every other variant. Fields are only "inherited" from the
 * parent item for legacy variants created before this DTO carried its own
 * copy of everything (see ItemService#toVariantDTO).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVariantDTO {

    private Long id;

    private String name;

    private String category;

    private String description;

    private String inventor;

    private LocalDate productDevCompletionDate;

    private String imageUrl;

    /* ── Development ── */
    private String developmentStatus;
    private String developmentDate;
    private String remarks;

    /* ── ToT ── */
    private String totStatus;
    private String totDocumentNo;
    private LocalDate filledDate;
    @Builder.Default
    private List<String> totDocumentsFiled = new ArrayList<>();
    @Builder.Default
    private List<ToTPartnerDTO> totPartners = new ArrayList<>();

    /** True when a ToT partner's validity date on this variant has expired. */
    private boolean hasOverdueTot;

    /** Human-readable reason for the ToT-overdue warning (hover tooltip). */
    private String totOverdueMessage;

    /* ── Trials ── */
    private String trialsStatus;
    private LocalDate sampleRequestDate;
    private LocalDate sampleSubmissionDate;
    @Builder.Default
    private List<TrialStakeholderDTO> trialStakeholders = new ArrayList<>();

    /** True when any trial-feedback round on this variant is currently overdue. */
    private boolean hasOverdueFeedback;

    /* ── IPR ── */
    private String iprStatus;
    private String iprStatusLabel;
    private IPRDetailDTO iprDetail;

    /* ── Documentation ── */
    @Builder.Default
    private List<String> documentation = new ArrayList<>();
    @Builder.Default
    private List<ItemDocumentDTO> uploadedDocuments = new ArrayList<>();

    /* ── Procurement ── */
    private Integer crbfCount;
    private Integer ssbCount;
    @Builder.Default
    private List<ProcurementDetailDTO> procurementDetails = new ArrayList<>();

    /* ── Key Information ── */
    private String weight;
    private String size;
    private String material;
    private String color;
    private Double unitCost;
    private String vendor;
    private String warranty;

    private LocalDateTime updatedAt;

    /**
     * Request body for POST /items/{id}/variants/convert — turns an item
     * without variants into one with a first variant, moving its existing
     * details across without losing anything.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConvertRequest {
        private String name;
    }

    /**
     * Request body for POST /items/{id}/variants — creates an additional
     * variant, either blank or copied from an existing one.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private String name;

        /** "blank" (default) or "copy" */
        private String mode;

        /** Required when mode == "copy" and copying from an existing variant */
        private Long copyFromVariantId;

        /** When mode == "copy", set true to copy from the item's own base data
         *  instead of another variant — used when the item has no variants yet. */
        private boolean copyFromItem;
    }
}