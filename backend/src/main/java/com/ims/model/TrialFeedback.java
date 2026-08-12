package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * One feedback/trial round for a {@link TrialStakeholder}. A stakeholder can
 * accumulate any number of these over time (Feedback 1, Feedback 2, Feedback
 * 3, ...) — every "+ Add Trial / Feedback" click creates a new, independent
 * row here; existing rows are never overwritten.
 */
@Entity
@Table(name = "trial_feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sampleNo;

    /** "Request Trial Date" */
    @Column(name = "request_trial_date")
    private LocalDate requestTrialDate;

    @Column(name = "sample_submission_date")
    private LocalDate sampleSubmissionDate;

    /** Set once the stakeholder actually responds with feedback. */
    @Column(name = "feedback_received_date")
    private LocalDate feedbackReceivedDate;

    private String feedback;

    private String correction;

    private String furtherAction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    @Builder.Default
    private TrialStakeholder.Status status = TrialStakeholder.Status.NOT_STARTED;

    /* ── Feedback-overdue reminder tracking ──
     * True once a sample has been submitted, 7+ days have passed, and no
     * feedback has been received yet. Cleared automatically the moment
     * feedbackReceivedDate is set. Persisted (rather than computed on every
     * read) so the reminder job can tell "already flagged" apart from
     * "newly overdue" and avoid firing duplicate notifications. */
    @Column(name = "feedback_overdue", nullable = false)
    @Builder.Default
    private boolean feedbackOverdue = false;

    /** When the overdue reminder notification was last sent for this record. */
    @Column(name = "overdue_notified_at")
    private LocalDateTime overdueNotifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stakeholder_id")
    private TrialStakeholder trialStakeholder;
}
