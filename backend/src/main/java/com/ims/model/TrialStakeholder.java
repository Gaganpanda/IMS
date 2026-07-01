package com.ims.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    private LocalDate sampleRequestDate;

    private LocalDate sampleSubmissionDate;

    private String feedback;

    private String correction;

    private String furtherAction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    @Builder.Default
    private Status status = Status.NOT_STARTED;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

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
                case "On Hold"     -> ON_HOLD;
                default -> {
                    try { yield valueOf(value.toUpperCase().replace(" ", "_")); }
                    catch (Exception e) { yield null; }
                }
            };
        }
    }
}