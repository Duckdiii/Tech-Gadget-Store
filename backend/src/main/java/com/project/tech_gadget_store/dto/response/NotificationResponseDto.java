package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.NotificationStatus;
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
    private String message;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
}
