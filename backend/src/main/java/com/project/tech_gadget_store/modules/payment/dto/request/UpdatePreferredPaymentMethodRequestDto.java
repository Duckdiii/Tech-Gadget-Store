package com.project.tech_gadget_store.modules.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class UpdatePreferredPaymentMethodRequestDto {

    @NotBlank(message = "paymentType must not be blank")
    private String paymentType;
}
