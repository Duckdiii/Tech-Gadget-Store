package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;

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
public class FavoriteProductRequestDto {

    @NotBlank(message = "productId must not be blank")
    private String productId;
    @NotBlank(message = "customerId must not be blank")
    private String customerId;
    @NotNull(message = "status must not be null")
    private SubscriptionStatus status;
    private LocalDateTime subscribedAt;
    private LocalDateTime unsubscribedAt;
}
