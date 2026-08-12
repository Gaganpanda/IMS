package com.ims.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialFeedbackDTO {

    private Long id;

    private String sampleNo;

    private LocalDate requestTrialDate;

    private LocalDate sampleSubmissionDate;

    private LocalDate feedbackReceivedDate;

    private String feedback;

    private String correction;

    private String furtherAction;

    private String status;

    /** Read-only: true when a sample was submitted 7+ days ago with no
     *  feedback received yet. Drives the ⚠ warning icon on the frontend. */
    private boolean feedbackOverdue;
}
