package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.SupplierResponseDto;
import com.project.tech_gadget_store.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierResponseDto toResponseDto(Supplier supplier) {
        return toResponseDto(supplier, false);
    }

    public SupplierResponseDto toResponseDto(Supplier supplier, boolean hasActiveSupplyOrders) {
        if (supplier == null) return null;
        return SupplierResponseDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .isActive(supplier.getIsActive())
                .hasActiveSupplyOrders(hasActiveSupplyOrders)
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
