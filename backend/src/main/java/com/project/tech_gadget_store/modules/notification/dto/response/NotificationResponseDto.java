package com.project.tech_gadget_store.modules.notification.dto.response;

import com.project.tech_gadget_store.modules.notification.entity.Notification;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationStatus;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String title;
    private NotificationType type;
    private String message;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;

    // Dùng chung ở cả NotificationService (REST /api/notifications) và
    // OrderNotificationConsumer (đẩy qua WebSocket) — tránh 2 nơi map thủ công lệch cấu trúc JSON.
    public static NotificationResponseDto from(Notification n) {
        return NotificationResponseDto.builder()
                .id(n.getId())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .title(n.getTitle())
                .type(n.getType())
                .message(n.getMessage())
                .status(n.getStatus())
                .sentAt(n.getSentAt())
                .readAt(n.getReadAt())
                .build();
    }
}
