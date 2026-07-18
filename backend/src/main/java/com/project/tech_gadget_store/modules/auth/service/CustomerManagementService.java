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
    private final com.project.tech_gadget_store.modules.auth.repository.AccountRepository accountRepository;
    private final com.project.tech_gadget_store.modules.auth.repository.CustomerNoteRepository customerNoteRepository;
    private final com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository membershipRepository;

    public CustomerManagementService(
            CustomerRepository customerRepository, 
            OrderRepository orderRepository,
            InvoiceMapper invoiceMapper,
            com.project.tech_gadget_store.modules.auth.repository.AccountRepository accountRepository,
            com.project.tech_gadget_store.modules.auth.repository.CustomerNoteRepository customerNoteRepository,
            com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository membershipRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.invoiceMapper = invoiceMapper;
        this.accountRepository = accountRepository;
        this.customerNoteRepository = customerNoteRepository;
        this.membershipRepository = membershipRepository;
    }

    public CustomerPageResponseDto listCustomers(
            String search, 
            String tierParam, 
            String joinStartDateStr, 
            String joinEndDateStr, 
            BigDecimal minSpend, 
            BigDecimal maxSpend, 
            Boolean onlyRepeat,
            String sortBy,
            String sortDir,
            int page, 
            int size) {
        MembershipTier tier = parseTier(tierParam);
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        
        Sort sort;
        String direction = "asc".equalsIgnoreCase(sortDir) ? "ASC" : "DESC";
        if ("totalOrders".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.fromString(direction), "totalOrders");
        } else if ("totalSpend".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.fromString(direction), "totalSpend");
        } else {
            sort = Sort.by(Sort.Direction.fromString(direction), "createdAt");
        }
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        LocalDateTime joinStartDate = parseDateTime(joinStartDateStr, false);
        LocalDateTime joinEndDate = parseDateTime(joinEndDateStr, true);

        Page<Object[]> customerPage = customerRepository.searchCustomers(
                normalizedSearch, 
                tier, 
                joinStartDate, 
                joinEndDate, 
                minSpend, 
                maxSpend, 
                onlyRepeat,
                pageable);

        List<CustomerSummaryDto> items = customerPage.getContent().stream()
                .map(row -> {
                    Customer c = (Customer) row[0];
                    Long totalOrders = (Long) row[1];
                    BigDecimal totalSpend = (BigDecimal) row[2];
                    return CustomerSummaryDto.builder()
                            .id(c.getId())
                            .fullName(c.getFullName())
                            .email(c.getAccount().getEmail())
                            .phone(c.getPhone())
                            .tier(c.getMembership().getTier())
                            .totalOrders(totalOrders != null ? totalOrders : 0L)
                            .totalSpend(totalSpend != null ? totalSpend : BigDecimal.ZERO)
                            .joinDate(c.getCreatedAt())
                            .accountId(c.getAccount().getId())
                            .accountStatus(c.getAccount().getStatus().name())
                            .build();
                })
                .toList();

        return CustomerPageResponseDto.builder()
                .items(items)
                .page(customerPage.getNumber())
                .size(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .build();
    }

    private LocalDateTime parseDateTime(String dateStr, boolean isEnd) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            if (dateStr.contains("T")) {
                return LocalDateTime.parse(dateStr.trim());
            } else {
                LocalDate date = LocalDate.parse(dateStr.trim());
                return isEnd ? date.atTime(23, 59, 59, 999999999) : date.atStartOfDay();
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Định dạng ngày không hợp lệ: " + dateStr);
        }
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

        // Query purchased items history
        List<Object[]> rawItems = orderRepository.findAllPurchasedItemsWithDate(id);
        Map<String, com.project.tech_gadget_store.modules.auth.dto.response.PurchasedProductDto> grouped = new java.util.LinkedHashMap<>();
        for (Object[] row : rawItems) {
            com.project.tech_gadget_store.modules.order.entity.OrderItem oi = (com.project.tech_gadget_store.modules.order.entity.OrderItem) row[0];
            LocalDateTime orderDate = (LocalDateTime) row[1];
            com.project.tech_gadget_store.modules.catalog.entity.ProductVariant pv = oi.getProductVariant();
            if (pv != null && pv.getProduct() != null) {
                String pvId = pv.getId();
                com.project.tech_gadget_store.modules.auth.dto.response.PurchasedProductDto dto = grouped.get(pvId);
                if (dto == null) {
                    String imageUrl = null;
                    if (pv.getProduct().getImages() != null && !pv.getProduct().getImages().isEmpty()) {
                        imageUrl = pv.getProduct().getImages().get(0).getImageUrl();
                    }
                    dto = com.project.tech_gadget_store.modules.auth.dto.response.PurchasedProductDto.builder()
                            .productId(pv.getProduct().getId())
                            .productName(pv.getProduct().getName())
                            .productImageUrl(imageUrl)
                            .variantName(pv.getDisplayName())
                            .quantity(oi.getQuantity())
                            .lastPurchaseDate(orderDate)
                            .build();
                    grouped.put(pvId, dto);
                } else {
                    dto.setQuantity(dto.getQuantity() + oi.getQuantity());
                }
            }
        }
        List<com.project.tech_gadget_store.modules.auth.dto.response.PurchasedProductDto> purchasedProducts = new java.util.ArrayList<>(grouped.values());

        // Query notes history
        List<com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto> notes = customerNoteRepository.findByCustomerIdOrderByCreatedAtDesc(id)
                .stream()
                .map(this::toNoteResponseDto)
                .toList();

        // Membership progression
        com.project.tech_gadget_store.modules.loyalty.entity.Membership current = customer.getMembership();
        BigDecimal currentMin = current.getMinSpending() == null ? BigDecimal.ZERO : current.getMinSpending();
        BigDecimal finalTotalSpend = totalSpend == null ? BigDecimal.ZERO : totalSpend;

        com.project.tech_gadget_store.modules.loyalty.entity.Membership next = membershipRepository.findAll().stream()
                .filter(m -> (m.getMinSpending() == null ? BigDecimal.ZERO : m.getMinSpending()).compareTo(currentMin) > 0)
                .min(java.util.Comparator.comparing(m -> m.getMinSpending() == null ? BigDecimal.ZERO : m.getMinSpending()))
                .orElse(null);

        BigDecimal amountToNextTier = null;
        MembershipTier nextTier = null;
        BigDecimal nextTierMinSpending = null;

        if (next != null) {
            nextTier = next.getTier();
            nextTierMinSpending = next.getMinSpending();
            amountToNextTier = next.getMinSpending().subtract(finalTotalSpend).max(BigDecimal.ZERO);
        }

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
                .accountId(customer.getAccount().getId())
                .accountStatus(customer.getAccount().getStatus().name())
                .purchasedProducts(purchasedProducts)
                .notes(notes)
                .minSpending(current.getMinSpending())
                .maxSpending(current.getMaxSpending())
                .nextTier(nextTier)
                .nextTierMinSpending(nextTierMinSpending)
                .amountToNextTier(amountToNextTier)
                .build();
    }

    @org.springframework.transaction.annotation.Transactional
    public com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto addNote(String customerId, String email, String content) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        com.project.tech_gadget_store.modules.auth.entity.Account authorAccount = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Author account not found with email: " + email));
        
        com.project.tech_gadget_store.modules.auth.entity.CustomerNote note = new com.project.tech_gadget_store.modules.auth.entity.CustomerNote(customer, content, authorAccount.getUser().getFullName());
        note = customerNoteRepository.save(note);
        return toNoteResponseDto(note);
    }

    @org.springframework.transaction.annotation.Transactional
    public com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto updateNote(String noteId, String email, String content) {
        com.project.tech_gadget_store.modules.auth.entity.CustomerNote note = customerNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));
        
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content must not be blank");
        }
        
        note.setContent(content);
        note = customerNoteRepository.save(note);
        return toNoteResponseDto(note);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteNote(String noteId) {
        com.project.tech_gadget_store.modules.auth.entity.CustomerNote note = customerNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));
        customerNoteRepository.delete(note);
    }

    private com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto toNoteResponseDto(com.project.tech_gadget_store.modules.auth.entity.CustomerNote note) {
        return com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto.builder()
                .id(note.getId())
                .content(note.getContent())
                .authorName(note.getAuthorName())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
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
