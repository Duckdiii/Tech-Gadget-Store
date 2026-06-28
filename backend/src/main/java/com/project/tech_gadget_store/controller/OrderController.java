package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.dto.response.InvoiceItemResponseDto;
import com.project.tech_gadget_store.dto.response.OrderHistoryResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.mapper.AddressMapper;
import com.project.tech_gadget_store.mapper.InvoiceMapper;
import com.project.tech_gadget_store.repository.AddressRepository;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Validated
@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceMapper invoiceMapper;
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    public OrderController(OrderRepository orderRepository,
                           CustomerRepository customerRepository,
                           InvoiceMapper invoiceMapper,
                           AddressRepository addressRepository,
                           AddressMapper addressMapper) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.invoiceMapper = invoiceMapper;
        this.addressRepository = addressRepository;
        this.addressMapper = addressMapper;
    }

    @GetMapping("/customer/orders")
    public ResponseEntity<List<OrderHistoryResponseDto>> getCustomerOrders(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCustomer() != null && o.getCustomer().getId().equals(customer.getId()))
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .collect(Collectors.toList());

        List<OrderHistoryResponseDto> response = orders.stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/customer/orders/{orderId}/cancel")
    public ResponseEntity<OrderHistoryResponseDto> cancelCustomerOrder(
            @PathVariable String orderId,
            Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền hủy đơn hàng này");
        }

        try {
            order.cancel();
            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(mapToHistoryDto(savedOrder));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/manager/orders")
    public ResponseEntity<List<OrderHistoryResponseDto>> getManagerOrders(
            @RequestParam(required = false) String status) {
        List<Order> orders = orderRepository.findAll().stream()
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .collect(Collectors.toList());

        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            orders = orders.stream()
                    .filter(o -> o.getOrderStatus().name().equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());
        }

        List<OrderHistoryResponseDto> response = orders.stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/manager/orders/{orderId}/status")
    public ResponseEntity<OrderHistoryResponseDto> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }

        try {
            OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
            order.setOrderStatus(status);
            if (OrderStatus.COMPLETED.equals(status) && !order.isPaid()) {
                order.markPaid();
            }
            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(mapToHistoryDto(savedOrder));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ: " + statusStr);
        }
    }

    @GetMapping("/customer/addresses")
    public ResponseEntity<List<AddressResponseDto>> getCustomerAddresses(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        List<AddressResponseDto> addresses = addressRepository.findByCustomerId(customer.getId()).stream()
                .map(addr -> addressMapper.toAddressResponseDto(addr, customer.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(addresses);
    }

    private OrderHistoryResponseDto mapToHistoryDto(Order order) {
        List<InvoiceItemResponseDto> itemDtos = Collections.emptyList();
        if (order.getItems() != null) {
            itemDtos = order.getItems().stream()
                    .map(invoiceMapper::toInvoiceItemResponseDto)
                    .collect(Collectors.toList());
        }

        String pmName = order.getSelectedPaymentMethod() != null ? order.getSelectedPaymentMethod().getName() : "";
        String custName = order.getCustomer() != null ? order.getCustomer().getFullName() : "";

        return OrderHistoryResponseDto.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .total(order.calculateTotal())
                .customerName(custName)
                .paymentMethod(pmName)
                .items(itemDtos)
                .build();
    }
}
