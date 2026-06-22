package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import java.math.BigDecimal;
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
public class PaymentLogRequestDto {

    @NotBlank(message = "orderId must not be blank")
    private String orderId;
    private String transactionId;
    @NotNull(message = "amount must not be null")
    @DecimalMin(value = "0.00", message = "amount must not be negative")
    private BigDecimal amount;
    @NotNull(message = "status must not be null")
    private PaymentLogStatus status;
    private String failureReason;
}
