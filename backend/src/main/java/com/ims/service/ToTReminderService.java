package com.ims.service;

import com.ims.model.Item;
import com.ims.model.ItemVariant;
import com.ims.model.Notification;
import com.ims.model.ToTPartner;
import com.ims.repository.IPRDetailRepository;
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
 * Sends date-driven reminders for Product Development Completion, ToT
 * (Transfer of Technology) validity renewal, and IPR grant-pending status —
 * for both base Items and their variants, since each level can carry its own
 * dates.
 *
 * Rules (the same shape for all three):
 * - a single "coming up" reminder 7 days before the date (ToT validity only —
 * the other two have no advance-warning date to count down from),
 * - a "due/expires today" reminder on the day itself,
 * - then a "still pending" reminder every 7 days after that (every 30 days
 * for IPR grants, since patent/trademark prosecution runs on a much longer
 * timescale than a 7-day trial or ToT cycle) until the underlying record is
 * updated (marked Developed, renewed, or granted).
 *
 * This runs once a day, but each new firing REPLACES the previous still-
 * unread reminder for that exact record (NotificationService
 * #createRecurringReminder) instead of adding to it — otherwise a record
 * that's been overdue for months would leave behind one unread notification
 * per week forever, which is what previously made the bell feel like it was
 * firing nonstop. ToT validity used to also send one reminder per day for
 * each of the final 7 days before expiry (a genuine daily notification, by
 * design) — that daily countdown has been replaced with the same single
 * "due in 7 days" / "due today" / "every 7 days after" shape used for the
 * other two, so nothing in this service sends more than once per cycle.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ToTReminderService {

    private final ToTPartnerRepository totPartnerRepository;
    private final ItemRepository itemRepository;
    private final ItemVariantRepository itemVariantRepository;
    private final IPRDetailRepository iprDetailRepository;
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
            sendIprGrantPendingReminders();
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
            notifyDevCompletion(today, dueDate, item.getName(), item.getId(), item.getName(), ownerId, null);
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
            notifyDevCompletion(today, dueDate, label, parent.getId(), parent.getName(), ownerId, variant.getId());
        });
    }

    private void notifyDevCompletion(LocalDate today, LocalDate dueDate, String label,
            Long itemId, String itemName, Long ownerId, Long variantId) {
        long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);

        if (daysUntilDue == 7) {
            String message = label + ": Product Development Completion is due on "
                    + dueDate + " (in 7 days).";
            if (notificationService.alreadySentToday(itemId, Notification.NotificationType.DEV_COMPLETION, message))
                return;
            notificationService.createRecurringReminder(
                    "Product development due soon", message,
                    Notification.NotificationType.DEV_COMPLETION,
                    itemId, itemName, ownerId, variantId);
        } else if (daysUntilDue == 0) {
            String message = label + ": Product Development Completion is due today (" + dueDate + ").";
            if (notificationService.alreadySentToday(itemId, Notification.NotificationType.DEV_COMPLETION, message))
                return;
            notificationService.createRecurringReminder(
                    "Product development due today", message,
                    Notification.NotificationType.DEV_COMPLETION,
                    itemId, itemName, ownerId, variantId);
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
                notificationService.createRecurringReminder(
                        "Product development overdue", message,
                        Notification.NotificationType.DEV_COMPLETION,
                        itemId, itemName, ownerId, variantId);
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
            Long variantId = partner.getItemVariant() != null ? partner.getItemVariant().getId() : null;
            String firmLabel = partner.getTotFirm() != null && !partner.getTotFirm().isBlank()
                    ? partner.getTotFirm()
                    : "ToT partner";
            String label = partner.getItemVariant() != null
                    ? item.getName() + " — " + partner.getItemVariant().getName()
                    : item.getName();

            // FIX: this used to send a fresh reminder on EVERY one of the
            // final 7 days before expiry (7, 6, 5, 4, 3, 2, 1 days out) — a
            // genuine, by-design daily notification for a whole week
            // straight, which is exactly what read as "the same notification
            // every day" rather than a weekly reminder. Collapsed to the
            // same single "due in 7 days" shape used for dev-completion
            // above: one heads-up a week out, one on the day itself, then
            // one every 7 days after that until renewed.
            if (daysUntilExpiry == 7) {
                String message = label + ": ToT validity with " + firmLabel
                        + " expires on " + validityDate + " (in 7 days).";
                if (notificationService.alreadySentToday(item.getId(), Notification.NotificationType.TOT_VALIDITY,
                        message))
                    return;
                notificationService.createRecurringReminder(
                        "ToT validity expiring soon", message,
                        Notification.NotificationType.TOT_VALIDITY,
                        item.getId(), item.getName(), ownerId, variantId);
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
                    notificationService.createRecurringReminder(
                            "ToT renewal pending", message,
                            Notification.NotificationType.TOT_VALIDITY,
                            item.getId(), item.getName(), ownerId, variantId);
                }
            }
        });
    }

    /*
     * Runs every day at 08:00 server time — IPR grant-pending reminders.
     * New reminder type: previously nothing ever followed up on a patent,
     * trademark, design, or copyright application that was filed but never
     * resolved to granted/rejected — it could sit "Filed" forever with no
     * nudge to check on it. Cadence is 30 days (not 7): IP prosecution
     * timelines run in months/years, so a weekly nudge would just be noise.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendIprGrantPendingReminders() {
        LocalDate today = LocalDate.now();

        iprDetailRepository.findAll().forEach(detail -> {
            Item item = detail.getItem() != null ? detail.getItem()
                    : (detail.getItemVariant() != null ? detail.getItemVariant().getItem() : null);
            if (item == null) {
                return;
            }
            Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
            String baseLabel = detail.getItemVariant() != null
                    ? item.getName() + " — " + detail.getItemVariant().getName()
                    : item.getName();
            Long variantId = detail.getItemVariant() != null ? detail.getItemVariant().getId() : null;

            checkIprCategory(today, item, ownerId, variantId, baseLabel, "Patent",
                    detail.getPatentFiled(), detail.getPatentGranted(), detail.getPatentFilingDate());
            checkIprCategory(today, item, ownerId, variantId, baseLabel, "Trademark",
                    detail.getTrademarkFiled(), detail.getTrademarkGranted(), detail.getTrademarkFilingDate());
            checkIprCategory(today, item, ownerId, variantId, baseLabel, "Design",
                    detail.getDesignFiled(), detail.getDesignGranted(), detail.getDesignFilingDate());
            checkIprCategory(today, item, ownerId, variantId, baseLabel, "Copyright",
                    detail.getCopyrightFiled(), detail.getCopyrightGranted(), detail.getCopyrightFilingDate());
        });
    }

    private void checkIprCategory(LocalDate today, Item item, Long ownerId, Long variantId, String baseLabel,
            String category, Boolean filed, Boolean granted, LocalDate filingDate) {
        boolean isFiled = Boolean.TRUE.equals(filed);
        boolean isGranted = Boolean.TRUE.equals(granted);
        if (!isFiled || isGranted || filingDate == null) {
            return;
        }

        long daysSinceFiling = ChronoUnit.DAYS.between(filingDate, today);
        if (daysSinceFiling < 30 || daysSinceFiling % 30 != 0) {
            return;
        }

        String message = baseLabel + ": " + category + " filed on " + filingDate
                + " is still awaiting grant (" + daysSinceFiling + "d).";
        Notification.NotificationType type = Notification.NotificationType.IPR_CHANGED;
        if (notificationService.alreadySentToday(item.getId(), type, message)) {
            return;
        }
        notificationService.createRecurringReminder(
                category + " grant pending", message, type,
                item.getId(), item.getName(), ownerId, variantId);
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