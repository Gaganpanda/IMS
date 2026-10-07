package com.ims.service;

import com.ims.model.Item;
import com.ims.model.ItemVariant;
import com.ims.model.Notification;
import com.ims.model.TrialFeedback;
import com.ims.model.TrialStakeholder;
import com.ims.repository.TrialFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Watches every trial-feedback round for stakeholders that have gone quiet.
 *
 * Rule: once a sample has been submitted and 7 days pass with no feedback
 * received, the round is marked Feedback Overdue internally (the item/
 * variant gets its warning icon), and a "Feedback pending" notification is
 * fired. The moment feedbackReceivedDate is set (via the normal item/variant
 * save), the overdue flag is cleared and any outstanding reminder
 * notification for that record is resolved — see ItemService#buildStakeholder
 * / NotificationService#resolveFeedbackOverdueNotifications.
 *
 * This job only ever *raises* the flag; it never lowers it (that happens the
 * moment feedback is recorded). Once a round crosses the 7-day mark it keeps
 * getting reminded every 7 days after that instead of firing once and going
 * silent, since a still-unresolved round genuinely needs to keep surfacing
 * until it's dealt with — but each new firing replaces the previous week's
 * still-unread notification for that exact sample
 * (NotificationService#createSampleKeyedReminder) rather than stacking on
 * top of it, so the bell shows one current "Nd pending" status per sample,
 * not a new entry every single week forever. `alreadySentToday` (message
 * text includes the exact day count) separately guards against the same
 * day's scan running twice (e.g. a restart right after the 08:00 cron).
 *
 * Same pattern and cadence below for samples that were requested but never
 * submitted at all ("Sample submission pending").
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackReminderService {

    private final TrialFeedbackRepository trialFeedbackRepository;
    private final NotificationService notificationService;

    /*
     * Also run once right after the app finishes starting up — otherwise a
     * round that's already overdue (or already pending) before the server
     * ever boots would sit silently until the next 08:00 cron tick, exactly
     * the same startup gap that ToTReminderService already closes for its
     * own reminders.
     *
     * @Transactional here (not just on the two methods below) is required,
     * not decorative: this method calls sendFeedbackOverdueReminders() /
     * sendSamplePendingReminders() directly (self-invocation), which
     * bypasses Spring's proxy and silently skips their own @Transactional
     * entirely. Without a transaction spanning the whole method, the
     * Hibernate session used to fetch each TrialFeedback closes before its
     * lazy trialStakeholder is read, throwing LazyInitializationException.
     * Annotating this method keeps one transaction — and one open session —
     * active for the full scan.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void runOnStartup() {
        try {
            sendFeedbackOverdueReminders();
            sendSamplePendingReminders();
        } catch (Exception e) {
            log.error("Startup feedback reminder scan failed: {}", e.getMessage());
        }
    }

    /* Runs every day at 08:00 server time */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendFeedbackOverdueReminders() {
        LocalDate today = LocalDate.now();

        trialFeedbackRepository.findBySampleSubmissionDateIsNotNullAndFeedbackReceivedDateIsNull()
                .forEach(f -> checkAndNotify(f, today));
    }

    /*
     * Runs every day at 08:00 server time — separate scan for trials that
     * were requested but the sample was never actually submitted. These
     * previously got no reminder at all, since the overdue scan above only
     * looks at rounds that already have a submission date.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendSamplePendingReminders() {
        LocalDate today = LocalDate.now();

        trialFeedbackRepository.findByRequestTrialDateIsNotNullAndSampleSubmissionDateIsNull()
                .forEach(f -> checkAndNotifySamplePending(f, today));
    }

    private void checkAndNotify(TrialFeedback f, LocalDate today) {
        long daysSinceSubmission = ChronoUnit.DAYS.between(f.getSampleSubmissionDate(), today);
        if (daysSinceSubmission < 7) {
            return;
        }

        TrialStakeholder stakeholder = f.getTrialStakeholder();
        if (stakeholder == null)
            return;

        Item item = resolveItem(stakeholder);
        if (item == null)
            return;

        if (!f.isFeedbackOverdue()) {
            f.setFeedbackOverdue(true);
            trialFeedbackRepository.save(f);
        }

        // Fire right when it first crosses the 7-day mark, then keep repeating
        // every 7 days after that until feedback actually comes in — a round
        // that's still pending shouldn't go silent after the first nudge.
        if (daysSinceSubmission % 7 != 0) {
            return;
        }

        Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
        ItemVariant variant = stakeholder.getItemVariant();
        String stakeholderLabel = stakeholderLabel(stakeholder);

        // "Feedback pending" (not "overdue") — softer wording per product
        // decision; the 7-day threshold itself hasn't changed.
        String message = item.getName() + " — feedback from " + stakeholderLabel
                + " still pending (" + daysSinceSubmission + "d)";
        if (notificationService.alreadySentToday(item.getId(), Notification.NotificationType.FEEDBACK_OVERDUE,
                message)) {
            return;
        }

        // createSampleKeyedReminder (not createNotification) clears last
        // week's still-unread "feedback pending" entry for this exact sample
        // before raising the new one, so the bell shows only the current
        // 7/14/21-day status instead of a growing stack of every past week.
        notificationService.createSampleKeyedReminder(
                "Feedback pending",
                message,
                Notification.NotificationType.FEEDBACK_OVERDUE,
                item.getId(), item.getName(), ownerId,
                variant != null ? variant.getId() : null,
                stakeholder.getId(),
                f.getId(),
                f.getSampleNo());

        log.info("Feedback pending reminder sent — item '{}', stakeholder '{}', {} days", item.getName(),
                stakeholderLabel, daysSinceSubmission);
    }

    private void checkAndNotifySamplePending(TrialFeedback f, LocalDate today) {
        long daysSinceRequest = ChronoUnit.DAYS.between(f.getRequestTrialDate(), today);
        if (daysSinceRequest < 7) {
            return;
        }

        TrialStakeholder stakeholder = f.getTrialStakeholder();
        if (stakeholder == null)
            return;

        Item item = resolveItem(stakeholder);
        if (item == null)
            return;

        if (!f.isSamplePending()) {
            f.setSamplePending(true);
            trialFeedbackRepository.save(f);
        }

        // Same repeating cadence as the feedback-overdue reminder above —
        // fire at 7 days, then every 7 days after, until the sample actually
        // ships.
        if (daysSinceRequest % 7 != 0) {
            return;
        }

        Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
        ItemVariant variant = stakeholder.getItemVariant();
        String stakeholderLabel = stakeholderLabel(stakeholder);

        String message = item.getName() + " — sample not yet sent to " + stakeholderLabel
                + " (" + daysSinceRequest + "d)";
        if (notificationService.alreadySentToday(item.getId(), Notification.NotificationType.SAMPLE_PENDING,
                message)) {
            return;
        }

        // createSampleKeyedReminder clears last week's still-unread entry for
        // this exact sample first — see the comment on the feedback-pending
        // branch above for why.
        notificationService.createSampleKeyedReminder(
                "Sample submission pending",
                message,
                Notification.NotificationType.SAMPLE_PENDING,
                item.getId(), item.getName(), ownerId,
                variant != null ? variant.getId() : null,
                stakeholder.getId(),
                f.getId(),
                f.getSampleNo());

        log.info("Sample-pending reminder sent — item '{}', stakeholder '{}', {} days", item.getName(),
                stakeholderLabel, daysSinceRequest);
    }

    /*
     * Short, readable identifier for the stakeholder a reminder is about.
     * Falls back to "the trial stakeholder" on the rare row with no name set,
     * so the message never reads as a dangling "for ." fragment.
     */
    private String stakeholderLabel(TrialStakeholder stakeholder) {
        String name = stakeholder.getStakeholderName();
        return (name != null && !name.isBlank()) ? name : "the trial stakeholder";
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