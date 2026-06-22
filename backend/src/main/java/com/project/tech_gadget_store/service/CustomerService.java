package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.tech_gadget_store.dto.response.CustomerResponseDto;

import java.util.List;

@Service
@Transactional(readOnly = true)

public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    private CustomerResponseDto toDto(com.project.tech_gadget_store.entity.Customer c) {
        return CustomerResponseDto.builder()
                .id(c.getId())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .fullName(c.getFullName())
                .phone(c.getPhone())
                .membershipId(c.getMembership() != null ? c.getMembership().getId() : null)
                .cartId(c.getCart() != null ? c.getCart().getId() : null)
                .ordersIds(c.getOrders().stream().map(o -> o.getId()).toList())
                .addressesIds(c.getAddresses().stream().map(a -> a.getId()).toList())
                .build();
    }

    public void deleteCustomerById(String id) {
        customerRepository.deleteById(id);
    }

    public CustomerResponseDto showCustomerProfile(String id) {
        return customerRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
}
