package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.NotificationStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {

    private String title;
    private String productSubscriptionId;
    private String message;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
}
