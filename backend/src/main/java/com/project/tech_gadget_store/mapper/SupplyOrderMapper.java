package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.SupplyOrderItemResponseDto;
import com.project.tech_gadget_store.dto.response.SupplyOrderResponseDto;
import com.project.tech_gadget_store.entity.SupplyOrder;
import com.project.tech_gadget_store.entity.SupplyOrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class SupplyOrderMapper {

    public SupplyOrderResponseDto toResponseDto(SupplyOrder order) {
        if (order == null) return null;
        List<SupplyOrderItemResponseDto> itemDtos = order.getItems().stream()
                .map(this::toItemResponseDto)
                .toList();
        BigDecimal totalValue = itemDtos.stream()
                .map(SupplyOrderItemResponseDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return SupplyOrderResponseDto.builder()
                .id(order.getId())
                .supplierId(order.getSupplier().getId())
                .supplierName(order.getSupplier().getName())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .notes(order.getNotes())
                .items(itemDtos)
                .totalValue(totalValue)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private SupplyOrderItemResponseDto toItemResponseDto(SupplyOrderItem item) {
        return SupplyOrderItemResponseDto.builder()
                .id(item.getId())
                .productVariantId(item.getProduct().getId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.calculateLineTotal())
                .build();
    }
}
