package com.ims.dto;

import lombok.*;
import java.time.LocalDateTime;

public class NotificationDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long   id;
        private String title;
        private String message;
        private String type;
        private boolean read;
        private Long   itemId;
        private String itemName;
        private LocalDateTime createdAt;
    }
}
