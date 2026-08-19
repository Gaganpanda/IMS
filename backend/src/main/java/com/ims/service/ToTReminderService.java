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
 * Rules (identical for dev-completion and ToT-validity):
 *  - 7 days before the date, send a single "coming up" reminder.
 *  - On the day itself, send a "due today" / "expired" reminder.
 *  - For ToT validity specifically, once it has passed, keep sending a
 *    "renewal pending" reminder every 7 days after that until the record is
 *    updated with a new validity date.
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

    /* Runs every day at 08:00 server time — Product Development Completion reminders */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendDevCompletionReminders() {
        LocalDate today = LocalDate.now();

        itemRepository.findAll().forEach(item -> {
            LocalDate dueDate = item.getProductDevCompletionDate();
            if (dueDate == null) {
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
            if (dueDate == null || parent == null) {
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
            notificationService.createNotification(
                    "Product development due soon",
                    label + ": Product Development Completion is due on "
                            + dueDate + " (in 7 days).",
                    Notification.NotificationType.DEV_COMPLETION,
                    itemId, itemName, ownerId);
        } else if (daysUntilDue == 0) {
            notificationService.createNotification(
                    "Product development due today",
                    label + ": Product Development Completion is due today (" + dueDate + ").",
                    Notification.NotificationType.DEV_COMPLETION,
                    itemId, itemName, ownerId);
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

            if (daysUntilExpiry == 7) {
                // Exactly one week before expiry
                notificationService.createNotification(
                        "ToT validity expiring soon",
                        label + ": ToT validity with " + firmLabel
                                + " expires on " + validityDate + " (in 7 days).",
                        Notification.NotificationType.TOT_VALIDITY,
                        item.getId(), item.getName(), ownerId);
            } else if (daysUntilExpiry <= 0) {
                // On the expiry day itself, and then every 7 days after that
                long daysSinceExpiry = -daysUntilExpiry;
                if (daysSinceExpiry % 7 == 0) {
                    notificationService.createNotification(
                            "ToT renewal pending",
                            label + ": ToT validity with " + firmLabel
                                    + " expired on " + validityDate + ". Renewal is pending.",
                            Notification.NotificationType.TOT_VALIDITY,
                            item.getId(), item.getName(), ownerId);
                }
            }
        });
    }

    /* A ToTPartner belongs to exactly one of item / itemVariant — resolve
     * whichever base Item actually owns it either way. */
    private Item resolveItem(ToTPartner partner) {
        if (partner.getItem() != null) {
            return partner.getItem();
        }
        ItemVariant variant = partner.getItemVariant();
        return variant != null ? variant.getItem() : null;
    }
}
