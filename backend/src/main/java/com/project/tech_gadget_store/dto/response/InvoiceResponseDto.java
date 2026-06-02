package com.project.tech_gadget_store.dto.response;

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
public class InvoiceResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String orderId;
    private BigDecimal vatAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private LocalDateTime issuedAt;
}
