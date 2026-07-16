package com.project.tech_gadget_store.modules.auth.mapper;

import com.project.tech_gadget_store.modules.auth.dto.response.CustomerResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import java.util.List;
import org.springframework.stereotype.Component;



@Component
public class CustomerMapper {

    public CustomerResponseDto toCustomerResponseDto(Customer c) {
        return CustomerResponseDto.builder()
                .id(c.getId())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .fullName(c.getFullName())
                .phone(c.getPhone())
                .email(c.getAccount() != null ? c.getAccount().getEmail() : null)
                .membershipId(c.getMembership() != null ? c.getMembership().getId() : null)
                .cartId(c.getCart() != null ? c.getCart().getId() : null)
                .ordersIds(List.of())
                .addressesIds(c.getAddresses().stream().map(a -> a.getId()).toList())
                .preferredPaymentType(c.getPreferredPaymentType())
                .build();
    }
}
