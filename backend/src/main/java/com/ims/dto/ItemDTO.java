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
        @NotBlank(message = "Item name is required")
        @Size(max = 200)
        private String name;

        @NotBlank(message = "Item code is required")
        @Size(max = 50)
        private String code;

        private String category;

        @NotBlank(message = "Description is required")
        private String description;

        /* Accept string — service converts to enum */
        private String priority;
        private LocalDate expectedCompletionDate;

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

        @Size(max = 100)
        private String patentNumber;
        private LocalDate filingDate;

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
        private String code;
        private String category;
        private String description;
        private String priority;
        private String imageUrl;
        private LocalDate expectedCompletionDate;

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
        private String patentNumber;
        private LocalDate filingDate;

        private List<String> documentation;

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
        private String code;
        private String category;
        private String description;
        private String imageUrl;
        private String priority;
        private String developmentStatus;
        private String totStatus;
        private String iprStatus;
        private String trialsStatus;
        private LocalDateTime updatedAt;
    }
}