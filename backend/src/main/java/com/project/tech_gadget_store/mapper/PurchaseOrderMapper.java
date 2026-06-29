package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.PurchaseOrderItemResponseDto;
import com.project.tech_gadget_store.dto.response.PurchaseOrderResponseDto;
import com.project.tech_gadget_store.entity.PurchaseOrder;
import com.project.tech_gadget_store.entity.PurchaseOrderItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PurchaseOrderMapper {

    public PurchaseOrderResponseDto toResponseDto(PurchaseOrder order) {
        if (order == null) return null;
        List<PurchaseOrderItemResponseDto> itemDtos = order.getItems().stream()
                .map(this::toItemResponseDto)
                .toList();
        return PurchaseOrderResponseDto.builder()
                .id(order.getId())
                .supplierId(order.getSupplier().getId())
                .supplierName(order.getSupplier().getName())
                .orderedBy(order.getOrderedBy())
                .orderedAt(order.getOrderedAt())
                .status(order.getStatus())
                .note(order.getNote())
                .items(itemDtos)
                .totalValue(order.calculateTotalValue())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private PurchaseOrderItemResponseDto toItemResponseDto(PurchaseOrderItem item) {
        return PurchaseOrderItemResponseDto.builder()
                .id(item.getId())
                .productVariantId(item.getProductVariant().getId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.calculateLineTotal())
                .build();
    }
}
