package com.project.tech_gadget_store.modules.catalog.dto.response;

import com.project.tech_gadget_store.modules.loyalty.entity.enums.SubscriptionStatus;
import java.math.BigDecimal;
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
    private boolean isFavorite;

    // Variant details
    private String productName;
    private BigDecimal price;
    private Integer ramGb;
    private Integer storageGb;
    private String color;
    private String imageUrl;
}
