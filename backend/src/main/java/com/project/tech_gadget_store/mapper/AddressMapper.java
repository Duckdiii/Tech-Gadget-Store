package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.entity.Address;
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
                .build();
    }
}
