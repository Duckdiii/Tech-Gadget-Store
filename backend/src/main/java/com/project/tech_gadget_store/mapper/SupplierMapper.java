package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.SupplierResponseDto;
import com.project.tech_gadget_store.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierResponseDto toResponseDto(Supplier supplier) {
        if (supplier == null) return null;
        return SupplierResponseDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .isActive(supplier.getIsActive())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
