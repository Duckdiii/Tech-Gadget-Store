package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryResponseDto {
    private String id;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private BigDecimal total;
    private String customerName;
    private String paymentMethod;
    private List<InvoiceItemResponseDto> items;
}
