package com.project.tech_gadget_store.modules.order.controller;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.util.CursorUtil;
import com.project.tech_gadget_store.modules.auth.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.mapper.AddressMapper;
import com.project.tech_gadget_store.modules.auth.repository.AddressRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.order.dto.response.InvoiceItemResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderHistoryResponseDto;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.mapper.InvoiceMapper;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;



@Validated
@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceMapper invoiceMapper;
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final ProductSerialRepository productSerialRepository;

    public OrderController(OrderRepository orderRepository,
                           CustomerRepository customerRepository,
                           InvoiceMapper invoiceMapper,
                           AddressRepository addressRepository,
                           AddressMapper addressMapper,
                           ProductSerialRepository productSerialRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.invoiceMapper = invoiceMapper;
        this.addressRepository = addressRepository;
        this.addressMapper = addressMapper;
        this.productSerialRepository = productSerialRepository;
    }

    private void releaseOrderSerials(Order order) {
        if (order.getItems() != null) {
            for (com.project.tech_gadget_store.modules.order.entity.OrderItem item : order.getItems()) {
                List<ProductSerial> serials = productSerialRepository.findByInvoiceItemId(item.getId());
                if (serials != null && !serials.isEmpty()) {
                    for (ProductSerial serial : serials) {
                        serial.setStatus(SerialStatus.IN_STOCK);
                        serial.setInvoiceItemId(null);
                    }
                    productSerialRepository.saveAll(serials);
                }
            }
        }
    }

    @GetMapping("/customer/orders")
    public ResponseEntity<com.project.tech_gadget_store.common.dto.CursorPageResponseDto<OrderHistoryResponseDto>> getCustomerOrders(
            Authentication authentication,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        LocalDateTime cursorTimestamp = null;
        String cursorId = null;

        com.project.tech_gadget_store.common.util.CursorUtil.DecodedCursor decoded = com.project.tech_gadget_store.common.util.CursorUtil.decodeCursor(cursor);
        if (decoded != null) {
            cursorTimestamp = decoded.getTimestamp();
            cursorId = decoded.getId();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Order> orders = orderRepository.findOrdersCursor(customer.getId(), null, cursorTimestamp, cursorId, pageable);

        boolean hasNext = orders.size() > limit;
        List<Order> resultOrders = hasNext ? orders.subList(0, limit) : orders;

        List<OrderHistoryResponseDto> response = resultOrders.stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());

        String nextCursor = null;
        if (hasNext && !resultOrders.isEmpty()) {
            Order lastOrder = resultOrders.get(resultOrders.size() - 1);
            nextCursor = com.project.tech_gadget_store.common.util.CursorUtil.encodeCursor(lastOrder.getOrderDate(), lastOrder.getId());
        }

        return ResponseEntity.ok(new com.project.tech_gadget_store.common.dto.CursorPageResponseDto<>(response, nextCursor, hasNext));
    }

    @Transactional
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
            releaseOrderSerials(order);
            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(mapToHistoryDto(savedOrder));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/manager/orders/count")
    public ResponseEntity<com.project.tech_gadget_store.modules.order.dto.response.OrderCountResponseDto> countManagerOrders(
            @RequestParam String startDate, @RequestParam String endDate) {
        java.time.LocalDateTime from;
        java.time.LocalDateTime to;
        try {
            from = java.time.LocalDate.parse(startDate.trim()).atStartOfDay();
            to = java.time.LocalDate.parse(endDate.trim()).atTime(java.time.LocalTime.MAX);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khoảng thời gian không hợp lệ");
        }
        long count = orderRepository.countActiveOrdersByDateRange(from, to);
        return ResponseEntity.ok(
                com.project.tech_gadget_store.modules.order.dto.response.OrderCountResponseDto.builder()
                        .count(count)
                        .build());
    }

    @GetMapping("/manager/orders/pending-count")
    public ResponseEntity<com.project.tech_gadget_store.modules.order.dto.response.OrderCountResponseDto> countPendingOrders() {
        long count = orderRepository.countByOrderStatus(OrderStatus.AWAITING_CONFIRMATION);
        return ResponseEntity.ok(
                com.project.tech_gadget_store.modules.order.dto.response.OrderCountResponseDto.builder()
                        .count(count)
                        .build());
    }

    @GetMapping("/manager/orders/stats")
    public ResponseEntity<com.project.tech_gadget_store.modules.order.dto.response.OrderListStatsDto> getManagerOrderStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();

        long pending = orderRepository.countByOrderStatus(OrderStatus.AWAITING_CONFIRMATION);
        long shipping = orderRepository.countByOrderStatus(OrderStatus.SHIPPING);
        java.math.BigDecimal todayRev = orderRepository.sumCompletedOrdersRevenueSince(startOfDay);
        
        long cancelled = orderRepository.countCancelledOrdersSince(startOfMonth);
        long total = orderRepository.countTotalOrdersSince(startOfMonth);
        double cancelRate = total > 0 ? ((double) cancelled / total) * 100.0 : 0.0;

        return ResponseEntity.ok(com.project.tech_gadget_store.modules.order.dto.response.OrderListStatsDto.builder()
                .pendingCount(pending)
                .shippingCount(shipping)
                .todayRevenue(todayRev)
                .cancellationRate(cancelRate)
                .build());
    }

    @GetMapping("/manager/orders")
    public ResponseEntity<com.project.tech_gadget_store.common.dto.CursorPageResponseDto<OrderHistoryResponseDto>> getManagerOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        OrderStatus orderStatus = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase().trim());
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ");
            }
        }

        String searchParam = null;
        if (search != null && !search.isBlank()) {
            searchParam = "%" + search.trim() + "%";
        }

        LocalDateTime start = null;
        if (startDate != null && !startDate.isBlank()) {
            try {
                if (startDate.length() == 10) {
                    start = java.time.LocalDate.parse(startDate).atStartOfDay();
                } else {
                    start = LocalDateTime.parse(startDate);
                }
            } catch (Exception e) {
                // ignore
            }
        }

        LocalDateTime end = null;
        if (endDate != null && !endDate.isBlank()) {
            try {
                if (endDate.length() == 10) {
                    end = java.time.LocalDate.parse(endDate).atTime(23, 59, 59, 999_999_999);
                } else {
                    end = LocalDateTime.parse(endDate);
                }
            } catch (Exception e) {
                // ignore
            }
        }

        String pmParam = null;
        if (paymentMethod != null && !paymentMethod.isBlank() && !paymentMethod.equalsIgnoreCase("all")) {
            pmParam = paymentMethod.trim();
        }

        LocalDateTime cursorTimestamp = null;
        String cursorId = null;

        com.project.tech_gadget_store.common.util.CursorUtil.DecodedCursor decoded = com.project.tech_gadget_store.common.util.CursorUtil.decodeCursor(cursor);
        if (decoded != null) {
            cursorTimestamp = decoded.getTimestamp();
            cursorId = decoded.getId();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Order> orders = orderRepository.findOrdersCursorForManager(
                orderStatus, searchParam, start, end, pmParam, cursorTimestamp, cursorId, pageable);

        boolean hasNext = orders.size() > limit;
        List<Order> resultOrders = hasNext ? orders.subList(0, limit) : orders;

        List<OrderHistoryResponseDto> response = resultOrders.stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());

        String nextCursor = null;
        if (hasNext && !resultOrders.isEmpty()) {
            Order lastOrder = resultOrders.get(resultOrders.size() - 1);
            nextCursor = com.project.tech_gadget_store.common.util.CursorUtil.encodeCursor(lastOrder.getOrderDate(), lastOrder.getId());
        }

        return ResponseEntity.ok(new com.project.tech_gadget_store.common.dto.CursorPageResponseDto<>(response, nextCursor, hasNext));
    }

    @Transactional
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
            order.transitionTo(status);
            if (OrderStatus.COMPLETED.equals(status) && !order.isPaid()) {
                order.markPaid();
            }
            if (OrderStatus.CANCELLED.equals(status)) {
                releaseOrderSerials(order);
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
