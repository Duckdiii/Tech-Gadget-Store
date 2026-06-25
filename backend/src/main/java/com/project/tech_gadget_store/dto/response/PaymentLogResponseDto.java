package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentLogResponseDto {
    private String id;
    private String orderId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentMethodType;
    private String status;
    private LocalDateTime timestamp;
    private LocalDateTime paidTime;
    private String failureReason;
    private Map<String, String> metadata;
}
