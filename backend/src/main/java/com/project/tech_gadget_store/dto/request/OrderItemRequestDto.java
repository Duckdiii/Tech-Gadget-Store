package com.project.tech_gadget_store.dto.request;

import java.math.BigDecimal;
import java.util.List;
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
public class OrderItemRequestDto {

    private String orderId;
    private String productId;
    private Integer quantity;
    private List<String> bundleServicesIds;
    private BigDecimal unitPriceAtOrder;
}
