package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.dto.request.UpdateProfileRequestDto;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.dto.request.AddressRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.mapper.AddressMapper;
import com.project.tech_gadget_store.modules.auth.mapper.CustomerMapper;
import com.project.tech_gadget_store.modules.auth.repository.AddressRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.loyalty.dto.response.CustomerMembershipResponseDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.MembershipResponseDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.MembershipTierResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.mapper.MembershipMapper;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;



@Service
@Transactional(readOnly = true)
public class CustomerService {

    private static final String CUSTOMER_NOT_FOUND = "Customer not found with id: ";

    private final CustomerRepository customerRepository;
    private final MembershipRepository membershipRepository;
    private final OrderRepository orderRepository;
    private final CustomerMapper customerMapper;
    private final MembershipMapper membershipMapper;
    private final AddressMapper addressMapper;
    private final AddressRepository addressRepository;

    public CustomerService(CustomerRepository customerRepository,
            MembershipRepository membershipRepository,
            OrderRepository orderRepository,
            CustomerMapper customerMapper,
            MembershipMapper membershipMapper,
            AddressMapper addressMapper,
            AddressRepository addressRepository) {
        this.customerRepository = customerRepository;
        this.membershipRepository = membershipRepository;
        this.orderRepository = orderRepository;
        this.customerMapper = customerMapper;
        this.membershipMapper = membershipMapper;
        this.addressMapper = addressMapper;
        this.addressRepository = addressRepository;
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

    public CustomerMembershipResponseDto getMyMembership(String email) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));

        BigDecimal totalSpent = orderRepository.sumSpentByCustomerIdAndStatus(customer.getId(), OrderStatus.COMPLETED);
        if (totalSpent == null) {
            totalSpent = BigDecimal.ZERO;
        }

        Membership current = customer.getMembership();
        BigDecimal currentMin = current.getMinSpending() == null ? BigDecimal.ZERO : current.getMinSpending();

        Membership next = membershipRepository.findAll().stream()
                .filter(m -> (m.getMinSpending() == null ? BigDecimal.ZERO : m.getMinSpending()).compareTo(currentMin) > 0)
                .min(Comparator.comparing(m -> m.getMinSpending() == null ? BigDecimal.ZERO : m.getMinSpending()))
                .orElse(null);

        BigDecimal finalTotalSpent = totalSpent;
        return CustomerMembershipResponseDto.builder()
                .tier(current.getTier())
                .minSpending(current.getMinSpending())
                .maxSpending(current.getMaxSpending())
                .discountPercentage(current.getBenefit().getDiscountPercentage())
                .freeShipping(current.getBenefit().getFreeShipping())
                .description(current.getBenefit().getDescription())
                .totalSpent(totalSpent)
                .nextTier(next != null ? next.getTier() : null)
                .nextTierMinSpending(next != null ? next.getMinSpending() : null)
                .amountToNextTier(next != null ? next.getMinSpending().subtract(finalTotalSpent).max(BigDecimal.ZERO) : null)
                .build();
    }

    public List<MembershipTierResponseDto> getMembershipTiers() {
        return membershipRepository.findAll().stream()
                .sorted(Comparator.comparing(m -> m.getMinSpending() == null ? BigDecimal.ZERO : m.getMinSpending()))
                .map(membershipMapper::toTierResponseDto)
                .toList();
    }

    @Transactional
    public AddressResponseDto addAddress(AddressRequestDto request) {
        var customer = customerRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException(CUSTOMER_NOT_FOUND + request.getUserId()));
        Address address = new Address(request.getStreet(), request.getWard(),
                request.getDistrict(), request.getProvince());
        address.setName(request.getName());
        address.setPhone(request.getPhone());
        address.setType(request.getType());
        address.setIsDefault(request.getIsDefault() != null && request.getIsDefault());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            for (Address addr : customer.getAddresses()) {
                addr.setIsDefault(false);
            }
        } else if (customer.getAddresses().isEmpty()) {
            address.setIsDefault(true);
        }

        customer.getAddresses().add(address);
        customerRepository.save(customer);
        return addressMapper.toAddressResponseDto(address, customer.getId());
    }

    @Transactional
    public AddressResponseDto updateAddress(String addressId, AddressRequestDto request) {
        var customer = customerRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, CUSTOMER_NOT_FOUND + request.getUserId()));
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ"));
        
        if (!customer.getAddresses().contains(address)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Địa chỉ không thuộc về khách hàng này");
        }

        address.setStreet(request.getStreet());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setName(request.getName());
        address.setPhone(request.getPhone());
        address.setType(request.getType());

        boolean isDefaultChanged = request.getIsDefault() != null && request.getIsDefault();
        if (isDefaultChanged) {
            for (Address addr : customer.getAddresses()) {
                addr.setIsDefault(false);
            }
            address.setIsDefault(true);
        } else {
            address.setIsDefault(request.getIsDefault() != null && request.getIsDefault());
        }

        addressRepository.save(address);
        return addressMapper.toAddressResponseDto(address, customer.getId());
    }

    @Transactional
    public void deleteAddress(String email, String addressId) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ"));
        
        if (!customer.getAddresses().contains(address)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Địa chỉ không thuộc về khách hàng này");
        }

        customer.getAddresses().remove(address);
        customerRepository.save(customer);
    }

    @Transactional
    public CustomerResponseDto updateProfile(String email, UpdateProfileRequestDto request) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customerRepository.save(customer);
        return customerMapper.toCustomerResponseDto(customer);
    }

    /**
     * Tính lại hạng membership dựa trên tổng chi tiêu các đơn COMPLETED.
     * Gọi sau mỗi lần thanh toán thành công.
     */
    @Transactional
    public void recalculateMembership(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        CUSTOMER_NOT_FOUND + customerId));

        BigDecimal totalSpent = orderRepository.sumSpentByCustomerIdAndStatus(
                customerId, OrderStatus.COMPLETED);

        // sumSpent trả null nếu chưa có đơn nào — chuẩn hoá về ZERO
        if (totalSpent == null) {
            totalSpent = BigDecimal.ZERO;
        }

        // findBySpending dùng minSpending/maxSpending trong DB để khớp đúng hạng
        membershipRepository.findBySpending(totalSpent)
                .ifPresent(customer::assignMembership);
    }
}
