package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trial_stakeholders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialStakeholder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stakeholderName;

    /* Name of the individual contact person at the stakeholder organisation —
     * intentionally distinct from stakeholderName (the organisation/stakeholder
     * itself), since a stakeholder org and the person you deal with there are
     * not the same thing. */
    private String contactPersonName;

    private String stakeholderAddress;

    private String stakeholderPhone;

    /* Overall trial status for this stakeholder (independent of any single
     * feedback round's own status) — set when the stakeholder is added via
     * the "Add ToT Stakeholder" popup so the summary card/list can show it
     * without needing to open a feedback round. */
    @Enumerated(EnumType.STRING)
    @Column(name = "trial_status", length = 30)
    @Builder.Default
    private Status trialStatus = Status.NOT_STARTED;

    /* A stakeholder can be sent samples and asked for feedback any number of
     * times — each round (sample no., dates, status, feedback text) is its
     * own independent TrialFeedback row. "+ Add Trial / Feedback" always
     * appends a new one here; existing rounds are never overwritten. */
    @OneToMany(
            mappedBy = "trialStakeholder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<TrialFeedback> feedbacks = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    /* Set when this stakeholder belongs to a specific variant instead of the
     * base item directly — exactly one of item/itemVariant is non-null. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ItemVariant itemVariant;

    public enum Status {
        NOT_STARTED, IN_PROGRESS, TESTING, COMPLETED, ON_HOLD;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static Status fromString(String value) {
            if (value == null) return null;
            return switch (value.trim()) {
                case "Not Started" -> NOT_STARTED;
                case "In Progress" -> IN_PROGRESS;
                case "Testing"     -> TESTING;
                case "Completed"   -> COMPLETED;
                case "Pending"     -> ON_HOLD;
                case "On Hold"     -> ON_HOLD;
                default -> {
                    try { yield valueOf(value.toUpperCase().replace(" ", "_")); }
                    catch (Exception e) { yield null; }
                }
            };
        }
    }
}