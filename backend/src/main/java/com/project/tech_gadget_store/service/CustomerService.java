package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.CustomerResponseDto;
import com.project.tech_gadget_store.mapper.CustomerMapper;
import com.project.tech_gadget_store.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    public void deleteCustomerById(String id) {
        customerRepository.deleteById(id);
    }

    public CustomerResponseDto showCustomerProfile(String id) {
        return customerRepository.findById(id)
                .map(customerMapper::toCustomerResponseDto)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
}
