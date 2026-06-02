package com.project.tech_gadget_store.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public class InvoiceRequestDto {

    private String orderId;
    private BigDecimal vatAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private LocalDateTime issuedAt;
}
