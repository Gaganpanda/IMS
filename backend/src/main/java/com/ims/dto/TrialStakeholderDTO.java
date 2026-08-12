package com.ims.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialStakeholderDTO {

    private Long id;

    private String stakeholderName;

    private String contactPersonName;

    private String stakeholderAddress;

    private String stakeholderPhone;

    /** Overall trial status for this stakeholder — e.g. "Not Started",
     *  "In Progress", "Testing", "Completed", "On Hold". Independent of any
     *  single feedback round's own status. */
    private String trialStatus;

    /** Every feedback/trial round for this stakeholder — "Feedback 1",
     *  "Feedback 2", etc. Always appended to, never overwritten. */
    @Builder.Default
    private List<TrialFeedbackDTO> feedbacks = new ArrayList<>();

    /** Read-only: true when any feedback round on this stakeholder is
     *  currently overdue. */
    private boolean hasOverdueFeedback;
}
