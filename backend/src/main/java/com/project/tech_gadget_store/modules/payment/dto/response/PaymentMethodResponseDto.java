package com.project.tech_gadget_store.modules.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodResponseDto {
    private String id;
    private String name;
    private String description;
    private String type; // "MOMO", "VNPAY", "COD"
}
