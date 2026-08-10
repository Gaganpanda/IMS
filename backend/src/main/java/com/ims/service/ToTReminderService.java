package com.ims.service;

import com.ims.model.Item;
import com.ims.model.Notification;
import com.ims.model.ToTPartner;
import com.ims.model.User;
import com.ims.repository.ItemRepository;
import com.ims.repository.ToTPartnerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Sends ToT (Transfer of Technology) validity renewal reminders.
 *
 * Rules:
 *  - 1 week (7 days) before the ToT validity date expires, send a single
 *    "ToT renewal upcoming" reminder.
 *  - Once the validity date has passed, send a "ToT renewal pending" reminder
 *    on the day it expires, and then again every 7 days after that, until the
 *    partner record is updated with a new validity date.
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

            long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);
            Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;

            if (daysUntilDue == 7) {
                notificationService.createNotification(
                        "Product development due soon",
                        item.getName() + ": Product Development Completion is due on "
                                + dueDate + " (in 7 days).",
                        Notification.NotificationType.DEV_COMPLETION,
                        item.getId(), item.getName(), ownerId);
            } else if (daysUntilDue == 0) {
                notificationService.createNotification(
                        "Product development due today",
                        item.getName() + ": Product Development Completion is due today (" + dueDate + ").",
                        Notification.NotificationType.DEV_COMPLETION,
                        item.getId(), item.getName(), ownerId);
            }
        });
    }

    /* Runs every day at 08:00 server time — ToT validity renewal reminders */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendToTValidityReminders() {
        LocalDate today = LocalDate.now();

        totPartnerRepository.findAll().forEach(partner -> {
            LocalDate validityDate = partner.getTotValidityDate();
            if (validityDate == null) {
                return;
            }

            Item item = partner.getItem();
            if (item == null) {
                return;
            }

            long daysUntilExpiry = ChronoUnit.DAYS.between(today, validityDate);
            Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
            String firmLabel = partner.getTotFirm() != null && !partner.getTotFirm().isBlank()
                    ? partner.getTotFirm()
                    : "ToT partner";

            if (daysUntilExpiry == 7) {
                // Exactly one week before expiry
                notificationService.createNotification(
                        "ToT validity expiring soon",
                        item.getName() + ": ToT validity with " + firmLabel
                                + " expires on " + validityDate + " (in 7 days).",
                        Notification.NotificationType.TOT_VALIDITY,
                        item.getId(), item.getName(), ownerId);
            } else if (daysUntilExpiry <= 0) {
                // On the expiry day itself, and then every 7 days after that
                long daysSinceExpiry = -daysUntilExpiry;
                if (daysSinceExpiry % 7 == 0) {
                    notificationService.createNotification(
                            "ToT renewal pending",
                            item.getName() + ": ToT validity with " + firmLabel
                                    + " expired on " + validityDate + ". Renewal is pending.",
                            Notification.NotificationType.TOT_VALIDITY,
                            item.getId(), item.getName(), ownerId);
                }
            }
        });
    }
}
