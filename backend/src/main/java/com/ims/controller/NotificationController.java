package com.ims.controller;

import com.ims.dto.ApiResponse;
import com.ims.dto.NotificationDTO;
import com.ims.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    /* ── GET all for current user ── */
    @GetMapping
    @Operation(summary = "Get all notifications for the current user")
    public ResponseEntity<ApiResponse<List<NotificationDTO.Response>>> getAllNotifications() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getAllForCurrentUser()));
    }

    /* ── GET unread count ── */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    /* ── PATCH mark one as read ── */
    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<NotificationDTO.Response>> markAsRead(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Notification marked as read",
                        notificationService.markAsRead(id)));
    }

    /* ── PATCH mark all as read ── */
    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    /* ── DELETE one ── */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    /* ── DELETE all ── */
    @DeleteMapping("/all")
    @Operation(summary = "Delete all notifications for current user")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications() {
        notificationService.deleteAllForCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("All notifications deleted", null));
    }
}
