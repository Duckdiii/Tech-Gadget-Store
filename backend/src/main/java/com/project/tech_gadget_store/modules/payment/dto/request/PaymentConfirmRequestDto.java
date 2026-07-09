package com.project.tech_gadget_store.modules.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
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
public class PaymentConfirmRequestDto {
    @NotEmpty(message = "cartItemIds must not be empty")
    private List<String> cartItemIds;
    @NotBlank(message = "addressId must not be blank")
    private String addressId;
    @NotBlank(message = "paymentMethodId must not be blank")
    private String paymentMethodId;
    private String clientIp;
    private String orderInfo;
}
