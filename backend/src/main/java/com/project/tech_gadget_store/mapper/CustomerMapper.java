package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.CustomerResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CustomerMapper {

    public CustomerResponseDto toCustomerResponseDto(Customer c) {
        return CustomerResponseDto.builder()
                .id(c.getId())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .fullName(c.getFullName())
                .phone(c.getPhone())
                .membershipId(c.getMembership() != null ? c.getMembership().getId() : null)
                .cartId(c.getCart() != null ? c.getCart().getId() : null)
                .ordersIds(List.of())
                .addressesIds(c.getAddresses().stream().map(a -> a.getId()).toList())
                .build();
    }
}
