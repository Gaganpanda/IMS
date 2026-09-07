package com.ims.service;

import com.ims.model.Item;
import com.ims.model.ItemVariant;
import com.ims.model.Notification;
import com.ims.model.ToTPartner;
import com.ims.repository.ItemRepository;
import com.ims.repository.ItemVariantRepository;
import com.ims.repository.ToTPartnerRepository;
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
 * Sends date-driven reminders for Product Development Completion and ToT
 * (Transfer of Technology) validity renewal — for both base Items and their
 * variants, since either level can carry its own dates.
 *
 * Rules:
 * - Product Development Completion: a single "coming up" reminder 7 days
 * before the date, a "due today" reminder on the day itself, then a
 * "still overdue" reminder every 7 days after that until marked Developed.
 * - ToT validity: a daily countdown reminder for each of the final 7 days
 * before expiry (7, 6, 5, 4, 3, 2, 1 days out), an "expires today" reminder
 * on the day itself, then a "renewal pending" reminder every 7 days after
 * that until the record is updated with a new validity date.
 *
 * This runs once a day. Since the check is purely date-arithmetic (exact day
 * counts), each qualifying day only fires once even though the job runs daily.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ToTReminderService {

    private final ToTPartnerRepository totPartnerRepository;
    private final ItemRepository itemRepository;
    private final ItemVariantRepository itemVariantRepository;
    private final NotificationService notificationService;

    /*
     * Also run once right after the app finishes starting up — otherwise a
     * date that's already overdue (or already inside its 7-day window)
     * before the server ever boots would sit silently until the next 08:00
     * cron tick, which made reminders feel like they "weren't coming" for
     * anything that predates this deployment/restart.
     *
     * @Transactional here (not just on the two methods below) is required,
     * not decorative: this method calls sendDevCompletionReminders() /
     * sendToTValidityReminders() directly (self-invocation), which bypasses
     * Spring's proxy and silently skips their own @Transactional entirely.
     * Without a transaction spanning the whole method, the Hibernate
     * session used to fetch each Item/ToTPartner closes before their lazy
     * fields (e.g. Item.createdBy) are read, throwing
     * LazyInitializationException. Annotating this method keeps one
     * transaction — and one open session — active for the full scan.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void runOnStartup() {
        try {
            sendDevCompletionReminders();
            sendToTValidityReminders();
        } catch (Exception e) {
            log.error("Startup reminder scan failed: {}", e.getMessage());
        }
    }

    /*
     * Runs every day at 08:00 server time — Product Development Completion
     * reminders
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendDevCompletionReminders() {
        LocalDate today = LocalDate.now();

        itemRepository.findAll().forEach(item -> {
            LocalDate dueDate = item.getProductDevCompletionDate();
            if (dueDate == null || item.getDevelopmentStatus() == Item.DevelopmentStatus.DEVELOPED) {
                return;
            }

            Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
            notifyDevCompletion(today, dueDate, item.getName(), item.getId(), item.getName(), ownerId);
        });

        // Variants carry their own, independent Product Development
        // Completion date — previously ignored entirely by this job, so a
        // variant could sail past its due date with no reminder at all.
        itemVariantRepository.findAllWithProductDevCompletionDate().forEach(variant -> {
            LocalDate dueDate = variant.getProductDevCompletionDate();
            Item parent = variant.getItem();
            if (dueDate == null || parent == null
                    || variant.getDevelopmentStatus() == Item.DevelopmentStatus.DEVELOPED) {
                return;
            }

            Long ownerId = parent.getCreatedBy() != null ? parent.getCreatedBy().getId() : null;
            String label = parent.getName() + " — " + variant.getName();
            notifyDevCompletion(today, dueDate, label, parent.getId(), parent.getName(), ownerId);
        });
    }

    private void notifyDevCompletion(LocalDate today, LocalDate dueDate, String label,
            Long itemId, String itemName, Long ownerId) {
        long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);

        if (daysUntilDue == 7) {
            String message = label + ": Product Development Completion is due on "
                    + dueDate + " (in 7 days).";
            if (notificationService.alreadySentToday(itemId, Notification.NotificationType.DEV_COMPLETION, message))
                return;
            notificationService.createNotification(
                    "Product development due soon", message,
                    Notification.NotificationType.DEV_COMPLETION,
                    itemId, itemName, ownerId);
        } else if (daysUntilDue == 0) {
            String message = label + ": Product Development Completion is due today (" + dueDate + ").";
            if (notificationService.alreadySentToday(itemId, Notification.NotificationType.DEV_COMPLETION, message))
                return;
            notificationService.createNotification(
                    "Product development due today", message,
                    Notification.NotificationType.DEV_COMPLETION,
                    itemId, itemName, ownerId);
        } else if (daysUntilDue < 0) {
            // Past due and still not marked Developed — keep reminding every
            // 7 days after the deadline instead of going silent forever,
            // same cadence as the ToT-validity "renewal pending" reminder.
            long daysOverdue = -daysUntilDue;
            if (daysOverdue % 7 == 0) {
                String message = label + ": Product Development Completion was due on " + dueDate
                        + " and the item is still not marked Developed.";
                if (notificationService.alreadySentToday(itemId, Notification.NotificationType.DEV_COMPLETION, message))
                    return;
                notificationService.createNotification(
                        "Product development overdue", message,
                        Notification.NotificationType.DEV_COMPLETION,
                        itemId, itemName, ownerId);
            }
        }
    }

    /* Runs every day at 08:00 server time — ToT validity renewal reminders */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendToTValidityReminders() {
        LocalDate today = LocalDate.now();

        // Every partner with a validity date — this now includes partners
        // attached to a variant instead of the base item directly (see
        // ToTPartnerRepository), which previously fell through the
        // `partner.getItem() == null` guard below and never got a reminder.
        totPartnerRepository.findAllWithValidityDate().forEach(partner -> {
            LocalDate validityDate = partner.getTotValidityDate();
            if (validityDate == null) {
                return;
            }

            Item item = resolveItem(partner);
            if (item == null) {
                return;
            }

            long daysUntilExpiry = ChronoUnit.DAYS.between(today, validityDate);
            Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
            String firmLabel = partner.getTotFirm() != null && !partner.getTotFirm().isBlank()
                    ? partner.getTotFirm()
                    : "ToT partner";
            String label = partner.getItemVariant() != null
                    ? item.getName() + " — " + partner.getItemVariant().getName()
                    : item.getName();

            if (daysUntilExpiry >= 1 && daysUntilExpiry <= 7) {
                // Daily countdown for the final week: 7, 6, 5, 4, 3, 2, 1 days out —
                // each day gets its own reminder instead of a single "one week out"
                // notice, so the urgency actually ramps up as the date gets closer.
                String dayWord = daysUntilExpiry == 1 ? "day" : "days";
                String message = label + ": ToT validity with " + firmLabel
                        + " expires on " + validityDate + " (in " + daysUntilExpiry + " " + dayWord + ").";
                if (notificationService.alreadySentToday(item.getId(), Notification.NotificationType.TOT_VALIDITY,
                        message))
                    return;
                String title = daysUntilExpiry == 1
                        ? "ToT validity expires tomorrow"
                        : "ToT validity expiring in " + daysUntilExpiry + " " + dayWord;
                notificationService.createNotification(
                        title, message,
                        Notification.NotificationType.TOT_VALIDITY,
                        item.getId(), item.getName(), ownerId);
            } else if (daysUntilExpiry <= 0) {
                // On the expiry day itself, and then every 7 days after that
                long daysSinceExpiry = -daysUntilExpiry;
                if (daysSinceExpiry % 7 == 0) {
                    String message = daysSinceExpiry == 0
                            ? label + ": ToT validity with " + firmLabel + " expires today (" + validityDate
                                    + "). Renewal is pending."
                            : label + ": ToT validity with " + firmLabel + " expired on " + validityDate
                                    + " (" + daysSinceExpiry + " days ago). Renewal is still pending.";
                    if (notificationService.alreadySentToday(item.getId(), Notification.NotificationType.TOT_VALIDITY,
                            message))
                        return;
                    notificationService.createNotification(
                            "ToT renewal pending", message,
                            Notification.NotificationType.TOT_VALIDITY,
                            item.getId(), item.getName(), ownerId);
                }
            }
        });
    }

    /*
     * A ToTPartner belongs to exactly one of item / itemVariant — resolve
     * whichever base Item actually owns it either way.
     */
    private Item resolveItem(ToTPartner partner) {
        if (partner.getItem() != null) {
            return partner.getItem();
        }
        ItemVariant variant = partner.getItemVariant();
        return variant != null ? variant.getItem() : null;
    }
}