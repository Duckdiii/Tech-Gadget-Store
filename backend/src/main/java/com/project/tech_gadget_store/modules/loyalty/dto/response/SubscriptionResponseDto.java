package com.project.tech_gadget_store.modules.loyalty.dto.response;

import com.project.tech_gadget_store.modules.loyalty.entity.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponseDto {

    private String productId;
    private String productName;
    private SubscriptionStatus status;
    private String message;
}
