package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.AddressRequestDto;
import com.project.tech_gadget_store.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.dto.response.CustomerResponseDto;
import com.project.tech_gadget_store.dto.response.MembershipResponseDto;
import com.project.tech_gadget_store.entity.Address;
import com.project.tech_gadget_store.mapper.AddressMapper;
import com.project.tech_gadget_store.mapper.CustomerMapper;
import com.project.tech_gadget_store.mapper.MembershipMapper;
import com.project.tech_gadget_store.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomerService {

    private static final String CUSTOMER_NOT_FOUND = "Customer not found with id: ";

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final MembershipMapper membershipMapper;
    private final AddressMapper addressMapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper,
            MembershipMapper membershipMapper, AddressMapper addressMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
        this.membershipMapper = membershipMapper;
        this.addressMapper = addressMapper;
    }

    public void deleteCustomerById(String id) {
        customerRepository.deleteById(id);
    }

    public CustomerResponseDto showCustomerProfile(String id) {
        return customerRepository.findById(id)
                .map(customerMapper::toCustomerResponseDto)
                .orElseThrow(() -> new RuntimeException(CUSTOMER_NOT_FOUND + id));
    }

    public MembershipResponseDto showCustomerMembership(String id) {
        return customerRepository.findById(id)
                .map(customer -> membershipMapper.toMembershipResponseDto(customer.getMembership()))
                .orElseThrow(() -> new RuntimeException(CUSTOMER_NOT_FOUND + id));
    }

    @Transactional
    public AddressResponseDto addAddress(AddressRequestDto request) {
        var customer = customerRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException(CUSTOMER_NOT_FOUND + request.getUserId()));
        Address address = new Address(request.getStreet(), request.getWard(),
                request.getDistrict(), request.getProvince());
        customer.getAddresses().add(address);
        customerRepository.save(customer);
        return addressMapper.toAddressResponseDto(address, customer.getId());
    }
}
