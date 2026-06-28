package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
    private BigDecimal originalAmount;
    private BigDecimal vatAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private LocalDateTime issuedAt;
    private String paymentMethod;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private List<InvoiceItemResponseDto> items;
}

