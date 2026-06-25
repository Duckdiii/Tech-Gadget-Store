package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

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
