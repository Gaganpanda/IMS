package com.ims.service;

import com.ims.dto.NotificationDTO;
import com.ims.exception.ResourceNotFoundException;
import com.ims.model.Notification;
import com.ims.model.User;
import com.ims.repository.NotificationRepository;
import com.ims.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /*
     * ── De-duplication guard for the daily reminder scans (ToTReminderService,
     * FeedbackReminderService) ── Both run once on startup and once daily via
     * cron; on any day where both firings would qualify (or the scan is
     * re-triggered), this stops the same exact reminder being created twice.
     * "Today" is treated as since local midnight.
     */
    @Transactional(readOnly = true)
    public boolean alreadySentToday(Long itemId, Notification.NotificationType type, String message) {
        if (itemId == null) {
            return false;
        }
        return notificationRepository.existsByItemIdAndTypeAndMessageAndCreatedAtAfter(
                itemId, type, message, LocalDate.now().atStartOfDay());
    }

    /* ── Get all for current user ── */
    @Transactional(readOnly = true)
    public List<NotificationDTO.Response> getAllForCurrentUser() {
        User user = currentUser();
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /* ── Unread count ── */
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = currentUser();
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    /* ── Mark one as read ── */
    @Transactional
    public NotificationDTO.Response markAsRead(Long id) {
        Notification notif = ownedNotification(id);
        notif.setRead(true);
        return toResponse(notificationRepository.save(notif));
    }

    /* ── Toggle favorite/star ── */
    @Transactional
    public NotificationDTO.Response toggleFavorite(Long id) {
        Notification notif = ownedNotification(id);
        notif.setFavorite(!notif.isFavorite());
        return toResponse(notificationRepository.save(notif));
    }

    /* ── Toggle archived state ── */
    @Transactional
    public NotificationDTO.Response toggleArchived(Long id) {
        Notification notif = ownedNotification(id);
        notif.setArchived(!notif.isArchived());
        return toResponse(notificationRepository.save(notif));
    }

    /* ── Mark all as read ── */
    @Transactional
    public void markAllAsRead() {
        User user = currentUser();
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    /* ── Delete one ── */
    @Transactional
    public void deleteNotification(Long id) {
        Notification notif = ownedNotification(id);
        notificationRepository.delete(notif);
    }

    /* ── Delete all for current user ── */
    @Transactional
    public void deleteAllForCurrentUser() {
        User user = currentUser();
        notificationRepository.deleteAllByUserId(user.getId());
    }

    /*
     * ── Fetch a notification and verify it belongs to the current user ──
     * markAsRead/toggleFavorite/toggleArchived/deleteNotification previously
     * did a plain findById(id) with no ownership check at all: any signed-in
     * user could mark, star, archive, or delete *any other user's*
     * notification just by guessing/incrementing the id in the request —
     * notifications go to every admin plus the item owner, so ids are dense
     * and easy to guess. Every single-notification mutation now goes
     * through this helper instead. A mismatch is reported as "not found"
     * rather than "forbidden" so a caller can't use the response to probe
     * which ids exist for other users.
     */
    private Notification ownedNotification(Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        User user = currentUser();
        if (notif.getUser() == null || !notif.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }
        return notif;
    }

    /* ── Internal: create + push via WebSocket ── */
    @Transactional
    public void createNotification(
            String title,
            String message,
            Notification.NotificationType type,
            Long itemId,
            String itemName) {
        createNotification(title, message, type, itemId, itemName, null, null, null, null, null);
    }

    /*
     * ── Internal: create + push, also notifying a specific owner (e.g. item
     * creator) ──
     */
    @Transactional
    public void createNotification(
            String title,
            String message,
            Notification.NotificationType type,
            Long itemId,
            String itemName,
            Long ownerUserId) {
        createNotification(title, message, type, itemId, itemName, ownerUserId, null, null, null, null);
    }

    /*
     * ── Internal: create + push, with a deep-link to the exact variant/
     * stakeholder/feedback record the notification is about ──
     */
    @Transactional
    public void createNotification(
            String title,
            String message,
            Notification.NotificationType type,
            Long itemId,
            String itemName,
            Long ownerUserId,
            Long variantId,
            Long stakeholderId,
            Long feedbackId) {
        createNotification(title, message, type, itemId, itemName, ownerUserId, variantId, stakeholderId, feedbackId,
                null);
    }

    /*
     * Runs in its own, independent transaction (REQUIRES_NEW) and never lets
     * an exception escape. Notifications are a best-effort side effect of
     * saving an item/variant/trial-stakeholder record — they must never be
     * able to fail (or roll back) the actual save the user is waiting on.
     * Previously a single bad notification insert (e.g. a legacy/undersized
     * DB column) would blow up the caller's @Transactional method and undo
     * everything else in it, which looked like unrelated "trial stakeholder
     * / dates" failures from the outside.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotification(
            String title,
            String message,
            Notification.NotificationType type,
            Long itemId,
            String itemName,
            Long ownerUserId,
            Long variantId,
            Long stakeholderId,
            Long feedbackId,
            String sampleNo) {
        try {
            // Recipients: every admin, plus the item's owner (deduplicated)
            List<User> recipients = new java.util.ArrayList<>(userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ADMIN)
                    .toList());

            if (ownerUserId != null && recipients.stream().noneMatch(u -> u.getId().equals(ownerUserId))) {
                userRepository.findById(ownerUserId).ifPresent(recipients::add);
            }

            for (User recipient : recipients) {
                try {
                    Notification notif = Notification.builder()
                            .user(recipient)
                            .title(title)
                            .message(message)
                            .type(type)
                            .itemId(itemId)
                            .itemName(itemName)
                            .variantId(variantId)
                            .stakeholderId(stakeholderId)
                            .feedbackId(feedbackId)
                            .sampleNo(sampleNo)
                            .read(false)
                            .build();

                    Notification saved = notificationRepository.saveAndFlush(notif);

                    // Push real-time via WebSocket to specific user
                    try {
                        messagingTemplate.convertAndSendToUser(
                                recipient.getUsername(),
                                "/queue/notifications",
                                toResponse(saved));
                    } catch (Exception e) {
                        log.warn("WebSocket push failed for user '{}': {}", recipient.getUsername(), e.getMessage());
                    }
                } catch (Exception e) {
                    log.error("Failed to create notification '{}' for user '{}': {}",
                            title, recipient.getUsername(), e.getMessage());
                }
            }
        } catch (Exception e) {
            // Belt-and-braces: nothing from notification creation should ever
            // propagate out and disrupt the caller's own save.
            log.error("Notification creation failed for '{}': {}", title, e.getMessage());
        }
    }

    /*
     * ── Resolve: remove any still-unread overdue-feedback notifications for a
     * specific sample once feedback has actually been received, so stale
     * "still waiting" reminders don't linger in the bell. Matched by
     * item + sample number rather than feedback row id, since stakeholder/
     * feedback rows are fully replaced (new ids) on every item/variant save. ──
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void resolveFeedbackOverdueNotifications(Long itemId, String sampleNo) {
        if (itemId == null || sampleNo == null || sampleNo.isBlank())
            return;
        try {
            notificationRepository.deleteByItemIdAndSampleNoAndTypeAndReadFalse(
                    itemId, sampleNo, Notification.NotificationType.FEEDBACK_OVERDUE);
        } catch (Exception e) {
            log.error("Failed to resolve overdue notifications for item {} sample '{}': {}",
                    itemId, sampleNo, e.getMessage());
        }
    }

    /*
     * ── Resolve: same idea, for "sample submission pending" reminders —
     * once a sample is actually submitted, any outstanding pending-sample
     * reminder for it is stale and should disappear from the bell. ──
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void resolveSamplePendingNotifications(Long itemId, String sampleNo) {
        if (itemId == null || sampleNo == null || sampleNo.isBlank())
            return;
        try {
            notificationRepository.deleteByItemIdAndSampleNoAndTypeAndReadFalse(
                    itemId, sampleNo, Notification.NotificationType.SAMPLE_PENDING);
        } catch (Exception e) {
            log.error("Failed to resolve sample-pending notifications for item {} sample '{}': {}",
                    itemId, sampleNo, e.getMessage());
        }
    }

    /* ── Mapper ── */
    private NotificationDTO.Response toResponse(Notification n) {
        return NotificationDTO.Response.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name().toLowerCase() : null)
                .read(n.isRead())
                .favorite(n.isFavorite())
                .archived(n.isArchived())
                .itemId(n.getItemId())
                .itemName(n.getItemName())
                .variantId(n.getVariantId())
                .stakeholderId(n.getStakeholderId())
                .feedbackId(n.getFeedbackId())
                .sampleNo(n.getSampleNo())
                .createdAt(n.getCreatedAt())
                .build();
    }

    /* ── Current user helper ── */
    private User currentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}