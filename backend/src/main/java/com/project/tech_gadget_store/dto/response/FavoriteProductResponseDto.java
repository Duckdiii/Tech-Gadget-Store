package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteProductResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String productId;
    private String customerId;
    private SubscriptionStatus status;
    private LocalDateTime subscribedAt;
    private LocalDateTime unsubscribedAt;
}
