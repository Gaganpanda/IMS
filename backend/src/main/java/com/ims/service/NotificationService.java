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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository  notificationRepository;
    private final UserRepository          userRepository;
    private final SimpMessagingTemplate   messagingTemplate;

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
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notif.setRead(true);
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
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }
        notificationRepository.deleteById(id);
    }

    /* ── Delete all for current user ── */
    @Transactional
    public void deleteAllForCurrentUser() {
        User user = currentUser();
        notificationRepository.deleteAllByUserId(user.getId());
    }

    /* ── Internal: create + push via WebSocket ── */
    @Transactional
    public void createNotification(
            String title,
            String message,
            Notification.NotificationType type,
            Long itemId,
            String itemName) {
        createNotification(title, message, type, itemId, itemName, null);
    }

    /* ── Internal: create + push, also notifying a specific owner (e.g. item creator) ── */
    @Transactional
    public void createNotification(
            String title,
            String message,
            Notification.NotificationType type,
            Long itemId,
            String itemName,
            Long ownerUserId) {

        // Recipients: every admin, plus the item's owner (deduplicated)
        List<User> recipients = new java.util.ArrayList<>(userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .toList());

        if (ownerUserId != null && recipients.stream().noneMatch(u -> u.getId().equals(ownerUserId))) {
            userRepository.findById(ownerUserId).ifPresent(recipients::add);
        }

        for (User recipient : recipients) {
            Notification notif = Notification.builder()
                    .user(recipient)
                    .title(title)
                    .message(message)
                    .type(type)
                    .itemId(itemId)
                    .itemName(itemName)
                    .read(false)
                    .build();

            Notification saved = notificationRepository.save(notif);

            // Push real-time via WebSocket to specific user
            try {
                messagingTemplate.convertAndSendToUser(
                    recipient.getUsername(),
                    "/queue/notifications",
                    toResponse(saved)
                );
            } catch (Exception e) {
                log.warn("WebSocket push failed for user '{}': {}", recipient.getUsername(), e.getMessage());
            }
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
                .itemId(n.getItemId())
                .itemName(n.getItemName())
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
