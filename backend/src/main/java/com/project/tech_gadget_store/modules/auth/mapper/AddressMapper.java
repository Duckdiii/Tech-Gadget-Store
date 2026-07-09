package com.project.tech_gadget_store.modules.auth.mapper;

import com.project.tech_gadget_store.modules.auth.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import org.springframework.stereotype.Component;


@Component
public class AddressMapper {

    public AddressResponseDto toAddressResponseDto(Address address, String userId) {
        return AddressResponseDto.builder()
                .id(address.getId())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .street(address.getStreet())
                .ward(address.getWard())
                .district(address.getDistrict())
                .province(address.getProvince())
                .userId(userId)
                .name(address.getName())
                .phone(address.getPhone())
                .type(address.getType())
                .isDefault(address.getIsDefault() != null && address.getIsDefault())
                .build();
    }
}
