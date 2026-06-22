package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
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
public class PaymentLogResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String orderId;
    private String transactionId;
    private BigDecimal amount;
    private PaymentLogStatus status;
    private String failureReason;
}
