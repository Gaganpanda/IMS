package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_user",    columnList = "user_id"),
    @Index(name = "idx_notif_read",    columnList = "is_read"),
    @Index(name = "idx_notif_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    /* Optional reference to the related item */
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_name", length = 200)
    private String itemName;

    /* ── Deep-link target (all optional) ──
     * Lets the frontend jump straight to the exact record a notification is
     * about instead of just the item: the variant (if the trial belongs to
     * one), the stakeholder, and the specific feedback/trial round. */
    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "stakeholder_id")
    private Long stakeholderId;

    @Column(name = "feedback_id")
    private Long feedbackId;

    /* Stable matching key for feedback-overdue resolution — row ids for
     * TrialFeedback churn on every item/variant save (the app fully
     * replaces stakeholder/feedback rows on each save rather than patching
     * them in place), so sampleNo is what actually survives a save and lets
     * us reliably find "the reminder for this sample" later to resolve it. */
    @Column(name = "sample_no", length = 100)
    private String sampleNo;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        ITEM_ADDED,
        STATUS_CHANGED,
        DOCUMENT_FILLED,
        IPR_CHANGED,
        DOCUMENT_UPLOAD,
        PROCUREMENT,
        TRIAL_UPDATE,
        TOT_VALIDITY,
        DEV_COMPLETION,
        FEEDBACK_OVERDUE,
        FEEDBACK_RECEIVED,
        GENERAL
    }
}
