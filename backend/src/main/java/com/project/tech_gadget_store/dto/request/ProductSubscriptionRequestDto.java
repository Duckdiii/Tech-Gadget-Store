package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
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
public class ProductSubscriptionRequestDto {

    private String productId;
    private String customerId;
    private SubscriptionStatus status;
    private LocalDateTime subscribedAt;
    private LocalDateTime unsubscribedAt;
    private String notificationId;
}
