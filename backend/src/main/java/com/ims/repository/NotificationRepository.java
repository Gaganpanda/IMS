package com.ims.repository;

import com.ims.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

        List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

        /**
         * Used to de-duplicate daily reminder scans: has a notification with this
         * exact item/type/message already been created since the given instant
         * (i.e. today)? Matching on message text (which embeds the exact day
         * count) means a reminder for "7 days out" and "6 days out" are treated
         * as distinct, so the countdown still fires once per day as intended.
         */
        boolean existsByItemIdAndTypeAndMessageAndCreatedAtAfter(
                        Long itemId,
                        Notification.NotificationType type,
                        String message,
                        LocalDateTime createdAtAfter);

        long countByUserIdAndReadFalse(Long userId);

        @Modifying
        @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
        void markAllAsReadByUserId(@Param("userId") Long userId);

        @Modifying
        @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
        void deleteAllByUserId(@Param("userId") Long userId);

        @Modifying
        @Query("DELETE FROM Notification n WHERE n.feedbackId = :feedbackId AND n.type = :type AND n.read = false")
        void deleteByFeedbackIdAndTypeAndReadFalse(
                        @Param("feedbackId") Long feedbackId,
                        @Param("type") Notification.NotificationType type);

        @Modifying
        @Query("DELETE FROM Notification n WHERE n.itemId = :itemId AND n.sampleNo = :sampleNo AND n.type = :type AND n.read = false")
        void deleteByItemIdAndSampleNoAndTypeAndReadFalse(
                        @Param("itemId") Long itemId,
                        @Param("sampleNo") String sampleNo,
                        @Param("type") Notification.NotificationType type);

        /**
         * Any existing (read or unread) overdue notification for this feedback —
         * used to avoid firing duplicate reminders.
         */
        boolean existsByFeedbackIdAndType(Long feedbackId, Notification.NotificationType type);
}