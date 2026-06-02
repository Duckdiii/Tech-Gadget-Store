package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.entity.enums.NotificationStatus;
import com.project.tech_gadget_store.entity.enums.NotificationType;
import java.time.LocalDateTime;
import java.util.List;
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
    private List<NotificationChannel> channels;
    private String customerId;
    private String message;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
}
