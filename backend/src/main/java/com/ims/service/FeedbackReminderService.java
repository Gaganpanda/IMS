package com.ims.service;

import com.ims.model.Item;
import com.ims.model.ItemVariant;
import com.ims.model.Notification;
import com.ims.model.TrialFeedback;
import com.ims.model.TrialStakeholder;
import com.ims.repository.TrialFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Watches every trial-feedback round for stakeholders that have gone quiet.
 *
 * Rule: once a sample has been submitted and 7 days pass with no feedback
 * received, the round is marked Feedback Overdue, a ⚠ notification is fired,
 * and the item/variant gets its warning icon. The moment feedbackReceivedDate
 * is set (via the normal item/variant save), the overdue flag is cleared and
 * any outstanding reminder notification for that record is resolved — see
 * ItemService#buildStakeholder / NotificationService#resolveFeedbackOverdueNotifications.
 *
 * This job only ever *raises* the flag; it never lowers it (that happens the
 * moment feedback is recorded), and it never sends a second notification for
 * a round that's already flagged overdue — so re-running daily can't spam.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackReminderService {

    private final TrialFeedbackRepository trialFeedbackRepository;
    private final NotificationService notificationService;

    /* Runs every day at 08:00 server time */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendFeedbackOverdueReminders() {
        LocalDate today = LocalDate.now();

        trialFeedbackRepository.findBySampleSubmissionDateIsNotNullAndFeedbackReceivedDateIsNull()
                .forEach(f -> checkAndNotify(f, today));
    }

    private void checkAndNotify(TrialFeedback f, LocalDate today) {
        long daysSinceSubmission = ChronoUnit.DAYS.between(f.getSampleSubmissionDate(), today);
        if (daysSinceSubmission < 7) {
            return;
        }

        TrialStakeholder stakeholder = f.getTrialStakeholder();
        if (stakeholder == null) return;

        Item item = resolveItem(stakeholder);
        if (item == null) return;

        boolean alreadyFlagged = f.isFeedbackOverdue();

        if (!alreadyFlagged) {
            f.setFeedbackOverdue(true);
            trialFeedbackRepository.save(f);
        }

        // Avoid duplicate reminder notifications for the same overdue round —
        // only fire once per round, right when it first crosses the 7-day mark.
        if (alreadyFlagged) {
            return;
        }

        String sampleLabel = (f.getSampleNo() != null && !f.getSampleNo().isBlank())
                ? f.getSampleNo() : ("#" + f.getId());
        Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
        ItemVariant variant = stakeholder.getItemVariant();

        notificationService.createNotification(
                "Feedback overdue",
                "No feedback has been received for Sample " + sampleLabel + " for 7 days. "
                        + "Please send another feedback request.",
                Notification.NotificationType.FEEDBACK_OVERDUE,
                item.getId(), item.getName(), ownerId,
                variant != null ? variant.getId() : null,
                stakeholder.getId(),
                f.getId(),
                f.getSampleNo());

        log.info("Feedback overdue reminder sent — item '{}', sample '{}'", item.getName(), sampleLabel);
    }

    private Item resolveItem(TrialStakeholder stakeholder) {
        if (stakeholder.getItem() != null) {
            return stakeholder.getItem();
        }
        if (stakeholder.getItemVariant() != null) {
            return stakeholder.getItemVariant().getItem();
        }
        return null;
    }
}
