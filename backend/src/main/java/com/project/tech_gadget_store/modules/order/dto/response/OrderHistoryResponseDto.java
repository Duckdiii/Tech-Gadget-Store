package com.project.tech_gadget_store.modules.order.dto.response;

import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
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
public class OrderHistoryResponseDto {
    private String id;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private BigDecimal total;
    private String customerName;
    private String paymentMethod;
    private List<InvoiceItemResponseDto> items;
}
