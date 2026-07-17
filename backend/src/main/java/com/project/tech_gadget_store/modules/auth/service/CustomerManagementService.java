package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerDetailResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerListStatsDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerPageResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerSummaryDto;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.order.dto.response.InvoiceItemResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderHistoryResponseDto;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.mapper.InvoiceMapper;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
@Transactional(readOnly = true)
public class CustomerManagementService {

    private static final List<MembershipTier> VIP_TIERS = List.of(MembershipTier.GOLD, MembershipTier.DIAMOND);

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final InvoiceMapper invoiceMapper;

    public CustomerManagementService(CustomerRepository customerRepository, OrderRepository orderRepository,
            InvoiceMapper invoiceMapper) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.invoiceMapper = invoiceMapper;
    }

    public CustomerPageResponseDto listCustomers(String search, String tierParam, int page, int size) {
        MembershipTier tier = parseTier(tierParam);
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Customer> customerPage = customerRepository.searchCustomers(normalizedSearch, tier, pageable);

        List<String> ids = customerPage.getContent().stream().map(Customer::getId).toList();
        Map<String, Long> orderCounts = toLongMap(orderRepository.countActiveOrdersForCustomerIds(ids));
        Map<String, BigDecimal> spends = toBigDecimalMap(orderRepository.sumCompletedSpendForCustomerIds(ids));

        List<CustomerSummaryDto> items = customerPage.getContent().stream()
                .map(c -> toSummaryDto(c, orderCounts, spends))
                .toList();

        return CustomerPageResponseDto.builder()
                .items(items)
                .page(customerPage.getNumber())
                .size(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .build();
    }

    public CustomerDetailResponseDto getCustomerDetail(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        long totalOrders = toLongMap(orderRepository.countActiveOrdersForCustomerIds(List.of(id)))
                .getOrDefault(id, 0L);
        BigDecimal totalSpend = orderRepository.sumSpentByCustomerIdAndStatus(id, OrderStatus.COMPLETED);

        List<Order> recentOrders = orderRepository.findOrdersCursor(id, null, null, null, PageRequest.of(0, 10));
        List<OrderHistoryResponseDto> recentOrderDtos = recentOrders.stream()
                .map(this::toOrderHistoryDto)
                .toList();
        long returnedOrders = orderRepository.countRefundedOrdersByCustomerId(id);
        // findOrdersCursor sorts by orderDate DESC regardless of status, so the first row (if
        // any) is simply the most recent order placed — that's what "last purchase" means here.
        LocalDateTime lastPurchaseDate = recentOrders.isEmpty() ? null : recentOrders.get(0).getOrderDate();

        return CustomerDetailResponseDto.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getAccount().getEmail())
                .phone(customer.getPhone())
                .address(formatAddress(customer))
                .tier(customer.getMembership().getTier())
                .totalOrders(totalOrders)
                .totalSpend(totalSpend == null ? BigDecimal.ZERO : totalSpend)
                .returnedOrders(returnedOrders)
                .lastPurchaseDate(lastPurchaseDate)
                .joinDate(customer.getCreatedAt())
                .recentOrders(recentOrderDtos)
                .build();
    }

    public CustomerListStatsDto getStatsSummary() {
        long total = customerRepository.count();
        LocalDateTime monthStart = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        long newThisMonth = customerRepository.countByCreatedAtBetween(monthStart, LocalDateTime.now());
        long vip = customerRepository.countByMembershipTierIn(VIP_TIERS);
        long repeatCustomers = orderRepository.findRepeatCustomerIds().size();
        double retentionRate = total > 0 ? (repeatCustomers * 100.0 / total) : 0.0;

        return CustomerListStatsDto.builder()
                .totalCustomers(total)
                .newThisMonth(newThisMonth)
                .vipCustomers(vip)
                .retentionRate(retentionRate)
                .build();
    }

    private CustomerSummaryDto toSummaryDto(Customer c, Map<String, Long> orderCounts, Map<String, BigDecimal> spends) {
        return CustomerSummaryDto.builder()
                .id(c.getId())
                .fullName(c.getFullName())
                .email(c.getAccount().getEmail())
                .phone(c.getPhone())
                .tier(c.getMembership().getTier())
                .totalOrders(orderCounts.getOrDefault(c.getId(), 0L))
                .totalSpend(spends.getOrDefault(c.getId(), BigDecimal.ZERO))
                .joinDate(c.getCreatedAt())
                .build();
    }

    private OrderHistoryResponseDto toOrderHistoryDto(Order order) {
        List<InvoiceItemResponseDto> itemDtos = order.getItems() == null
                ? Collections.emptyList()
                : order.getItems().stream().map(invoiceMapper::toInvoiceItemResponseDto).toList();

        return OrderHistoryResponseDto.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .total(order.calculateTotal())
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : "")
                .paymentMethod(order.getSelectedPaymentMethod() != null ? order.getSelectedPaymentMethod().getName() : "")
                .items(itemDtos)
                .build();
    }

    private String formatAddress(Customer customer) {
        if (customer.getAddresses() == null || customer.getAddresses().isEmpty()) {
            return null;
        }
        Address a = customer.getAddresses().get(0);
        return String.join(", ", a.getStreet(), a.getWard(), a.getDistrict(), a.getProvince());
    }

    private MembershipTier parseTier(String tierParam) {
        if (tierParam == null || tierParam.isBlank()) {
            return null;
        }
        try {
            return MembershipTier.valueOf(tierParam.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạng thành viên không hợp lệ: " + tierParam);
        }
    }

    private Map<String, Long> toLongMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<String, BigDecimal> toBigDecimalMap(List<Object[]> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], (BigDecimal) row[1]);
        }
        return map;
    }
}
