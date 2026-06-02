package com.project.tech_gadget_store.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomoPaymentMethodResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String partnerCode;
    private String merchantId;
    private String endpointUrl;
    private String returnUrl;
    private String notifyUrl;
}
