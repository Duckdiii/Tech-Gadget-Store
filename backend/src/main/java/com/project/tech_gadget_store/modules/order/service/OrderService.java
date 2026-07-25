package com.project.tech_gadget_store.modules.order.service;

import com.project.tech_gadget_store.common.constants.ErrorMessages;
import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.exception.ForbiddenException;
import com.project.tech_gadget_store.common.exception.InvalidStatusTransitionException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.common.util.CursorUtil;
import com.project.tech_gadget_store.modules.auth.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.mapper.AddressMapper;
import com.project.tech_gadget_store.modules.auth.repository.AddressRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.order.dto.response.InvoiceItemResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderCountResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderHistoryResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderListStatsDto;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.mapper.InvoiceMapper;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Order use cases for both the customer-facing storefront and the manager back-office.
 * Controllers ({@link com.project.tech_gadget_store.modules.order.controller.CustomerOrderController},
 * {@link com.project.tech_gadget_store.modules.order.controller.ManagerOrderController}) stay thin
 * and delegate all persistence access and business rules here.
 */
@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceMapper invoiceMapper;
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final ProductSerialRepository productSerialRepository;

    public OrderService(OrderRepository orderRepository,
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

    // -------------------------------------------------------------------------
    // Customer-facing
    // -------------------------------------------------------------------------

    public CursorPageResponseDto<OrderHistoryResponseDto> getCustomerOrders(String accountEmail, String cursor, int limit) {
        Customer customer = findCustomerByEmail(accountEmail);

        CursorUtil.DecodedCursor decoded = CursorUtil.decodeCursorOrStart(cursor);
        Pageable pageable = PageRequest.of(0, limit + 1);
        List<Order> orders = orderRepository.findOrdersCursor(
                customer.getId(), null, decoded.getTimestamp(), decoded.getId(), pageable);

        return CursorUtil.paginate(orders, limit, Order::getOrderDate, this::mapToHistoryDto);
    }

    @Transactional
    public OrderHistoryResponseDto cancelCustomerOrder(String accountEmail, String orderId) {
        Customer customer = findCustomerByEmail(accountEmail);
        Order order = findOrderById(orderId);

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("Bạn không có quyền hủy đơn hàng này");
        }

        try {
            order.cancel();
        } catch (IllegalStateException e) {
            throw new InvalidStatusTransitionException(e.getMessage());
        }
        releaseOrderSerials(order);
        Order savedOrder = orderRepository.save(order);
        return mapToHistoryDto(savedOrder);
    }

    public List<AddressResponseDto> getCustomerAddresses(String accountEmail) {
        Customer customer = findCustomerByEmail(accountEmail);
        return addressRepository.findByCustomerId(customer.getId()).stream()
                .map(addr -> addressMapper.toAddressResponseDto(addr, customer.getId()))
                .toList();
    }

    // -------------------------------------------------------------------------
    // Manager back-office
    // -------------------------------------------------------------------------

    public OrderCountResponseDto countOrdersByDateRange(String startDate, String endDate) {
        LocalDateTime from;
        LocalDateTime to;
        try {
            from = LocalDate.parse(startDate.trim()).atStartOfDay();
            to = LocalDate.parse(endDate.trim()).atTime(java.time.LocalTime.MAX);
        } catch (Exception e) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ");
        }
        long count = orderRepository.countActiveOrdersByDateRange(from, to);
        return OrderCountResponseDto.builder().count(count).build();
    }

    public OrderCountResponseDto countPendingOrders() {
        long count = orderRepository.countByOrderStatus(OrderStatus.AWAITING_CONFIRMATION);
        return OrderCountResponseDto.builder().count(count).build();
    }

    public OrderListStatsDto getManagerOrderStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();

        long pending = orderRepository.countByOrderStatus(OrderStatus.AWAITING_CONFIRMATION);
        long shipping = orderRepository.countByOrderStatus(OrderStatus.SHIPPING);
        BigDecimal todayRev = orderRepository.sumCompletedOrdersRevenueSince(startOfDay);

        long cancelled = orderRepository.countCancelledOrdersSince(startOfMonth);
        long total = orderRepository.countTotalOrdersSince(startOfMonth);
        double cancelRate = total > 0 ? ((double) cancelled / total) * 100.0 : 0.0;

        return OrderListStatsDto.builder()
                .pendingCount(pending)
                .shippingCount(shipping)
                .todayRevenue(todayRev)
                .cancellationRate(cancelRate)
                .build();
    }

    public CursorPageResponseDto<OrderHistoryResponseDto> getManagerOrders(
            String status, String search, String startDate, String endDate, String paymentMethod,
            String cursor, int limit) {
        OrderStatus orderStatus = parseOptionalStatus(status);
        String searchParam = (search != null && !search.isBlank()) ? "%" + search.trim() + "%" : null;
        LocalDateTime start = parseFlexibleDate(startDate, false);
        LocalDateTime end = parseFlexibleDate(endDate, true);
        String pmParam = (paymentMethod != null && !paymentMethod.isBlank() && !paymentMethod.equalsIgnoreCase("all"))
                ? paymentMethod.trim()
                : null;

        CursorUtil.DecodedCursor decoded = CursorUtil.decodeCursorOrStart(cursor);
        Pageable pageable = PageRequest.of(0, limit + 1);
        List<Order> orders = orderRepository.findOrdersCursorForManager(
                orderStatus, searchParam, start, end, pmParam, decoded.getTimestamp(), decoded.getId(), pageable);

        return CursorUtil.paginate(orders, limit, Order::getOrderDate, this::mapToHistoryDto);
    }

    @Transactional
    public Map<String, Object> bulkConfirmOrders(List<String> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách ID đơn hàng trống");
        }
        List<Order> toConfirm = orderRepository.findAllById(orderIds).stream()
                .filter(order -> order.getOrderStatus() == OrderStatus.AWAITING_CONFIRMATION)
                .toList();
        toConfirm.forEach(order -> order.transitionTo(OrderStatus.PROCESSING));
        orderRepository.saveAll(toConfirm);

        Map<String, Object> response = new HashMap<>();
        response.put("updatedCount", toConfirm.size());
        return response;
    }

    /** Builds the shipping manifest CSV for the given orders (UTF-8, with BOM for Excel). */
    public String exportOrdersToCsv(List<String> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách ID đơn hàng trống");
        }

        Map<String, Order> ordersById = orderRepository.findAllById(orderIds).stream()
                .collect(Collectors.toMap(Order::getId, order -> order));

        StringBuilder sb = new StringBuilder();
        sb.append((char) 0xFEFF); // UTF-8 BOM
        sb.append("MÃ ĐƠN HÀNG,TÊN NGƯỜI NHẬN,SỐ ĐIỆN THOẠI,ĐỊA CHỈ GIAO HÀNG,TIỀN COD (ĐỒNG),TRỌNG LƯỢNG (KG)\n");

        for (String id : orderIds) {
            Order order = ordersById.get(id);
            if (order != null) {
                sb.append(toManifestRow(order)).append("\n");
            }
        }

        return sb.toString();
    }

    @Transactional
    public OrderHistoryResponseDto updateOrderStatus(String orderId, String statusStr) {
        Order order = findOrderById(orderId);

        if (statusStr == null || statusStr.isBlank()) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ");
        }

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + statusStr);
        }

        order.transitionTo(status);
        if (OrderStatus.COMPLETED.equals(status) && !order.isPaid()) {
            order.markPaid();
        }
        if (OrderStatus.CANCELLED.equals(status)) {
            releaseOrderSerials(order);
        }
        Order savedOrder = orderRepository.save(order);
        return mapToHistoryDto(savedOrder);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Customer findCustomerByEmail(String accountEmail) {
        return customerRepository.findByAccountEmail(accountEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND));
    }

    private Order findOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));
    }

    private void releaseOrderSerials(Order order) {
        if (order.getItems() == null) {
            return;
        }
        for (OrderItem item : order.getItems()) {
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

    private OrderStatus parseOptionalStatus(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("all")) {
            return null;
        }
        try {
            return OrderStatus.valueOf(status.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ");
        }
    }

    /** Parses an optional date param (either {@code yyyy-MM-dd} or full ISO datetime); returns null when absent or unparsable. */
    private LocalDateTime parseFlexibleDate(String dateStr, boolean endOfDay) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            if (dateStr.length() == 10) {
                LocalDate date = LocalDate.parse(dateStr);
                return endOfDay ? date.atTime(23, 59, 59, 999_999_999) : date.atStartOfDay();
            }
            return LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    private OrderHistoryResponseDto mapToHistoryDto(Order order) {
        List<InvoiceItemResponseDto> itemDtos = Collections.emptyList();
        if (order.getItems() != null) {
            itemDtos = order.getItems().stream()
                    .map(invoiceMapper::toInvoiceItemResponseDto)
                    .toList();
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

    private String toManifestRow(Order o) {
        String recipientName = o.getAddress() != null && o.getAddress().getName() != null
                ? o.getAddress().getName()
                : (o.getCustomer() != null ? o.getCustomer().getFullName() : "");

        String phone = o.getAddress() != null && o.getAddress().getPhone() != null
                ? o.getAddress().getPhone()
                : (o.getCustomer() != null ? o.getCustomer().getPhone() : "");

        String fullAddr = "";
        if (o.getAddress() != null) {
            fullAddr = String.format("%s, %s, %s, %s",
                    o.getAddress().getStreet(),
                    o.getAddress().getWard(),
                    o.getAddress().getDistrict(),
                    o.getAddress().getProvince());
        }

        BigDecimal codAmount = BigDecimal.ZERO;
        if (o.getSelectedPaymentMethod() != null) {
            String pmName = o.getSelectedPaymentMethod().getName();
            if (pmName != null && (pmName.toUpperCase().contains("COD")
                    || pmName.toUpperCase().contains("TIỀN MẶT")
                    || pmName.toUpperCase().contains("CASH"))) {
                codAmount = o.calculateTotal();
            }
        }

        double totalWeight = 0.0;
        if (o.getItems() != null) {
            for (OrderItem item : o.getItems()) {
                double itemWeight = item.getProductVariant() != null
                        ? item.getProductVariant().getProduct().shippingWeightKg()
                        : 0.5;
                totalWeight += itemWeight * (item.getQuantity() != null ? item.getQuantity() : 1);
            }
        }

        return String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%.2f\"",
                o.getId().toUpperCase(),
                recipientName.replace("\"", "\"\""),
                phone.replace("\"", "\"\""),
                fullAddr.replace("\"", "\"\""),
                codAmount.toPlainString(),
                totalWeight);
    }
}
