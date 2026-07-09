package com.project.tech_gadget_store.modules.payment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequestDto {

    @NotBlank(message = "orderId must not be blank")
    private String orderId;

    @NotNull(message = "amount must not be null")
    @DecimalMin(value = "1000", message = "amount must be at least 1000 VND")
    private BigDecimal amount;

    private String clientIp = "127.0.0.1";

    private String orderInfo;
}
