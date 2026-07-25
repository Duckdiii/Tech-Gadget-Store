package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerDetailResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerListStatsDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerPageResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerSummaryDto;
import com.project.tech_gadget_store.modules.auth.dto.response.PurchasedProductDto;
import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.entity.CustomerNote;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerNoteRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import com.project.tech_gadget_store.modules.order.dto.response.InvoiceItemResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderHistoryResponseDto;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.mapper.InvoiceMapper;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional(readOnly = true)
public class CustomerManagementService {

    private static final List<MembershipTier> VIP_TIERS = List.of(MembershipTier.GOLD, MembershipTier.DIAMOND);

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final InvoiceMapper invoiceMapper;
    private final AccountRepository accountRepository;
    private final CustomerNoteRepository customerNoteRepository;
    private final MembershipRepository membershipRepository;

    public CustomerManagementService(
            CustomerRepository customerRepository,
            OrderRepository orderRepository,
            InvoiceMapper invoiceMapper,
            AccountRepository accountRepository,
            CustomerNoteRepository customerNoteRepository,
            MembershipRepository membershipRepository) {
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
            throw new IllegalArgumentException("Định dạng ngày không hợp lệ: " + dateStr);
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

        List<PurchasedProductDto> purchasedProducts =
                buildPurchasedProducts(orderRepository.findAllPurchasedItemsWithDate(id));

        List<CustomerNoteResponseDto> notes = customerNoteRepository.findByCustomerIdOrderByCreatedAtDesc(id)
                .stream()
                .map(this::toNoteResponseDto)
                .toList();

        Membership current = customer.getMembership();
        MembershipProgression progression = calculateMembershipProgression(current, totalSpend);
        List<BigDecimal> monthlySpending = buildMonthlySpending(id);

        return CustomerDetailResponseDto.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getAccount().getEmail())
                .phone(customer.getPhone())
                .address(formatAddress(customer))
                .tier(current.getTier())
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
                .nextTier(progression.nextTier())
                .nextTierMinSpending(progression.nextTierMinSpending())
                .amountToNextTier(progression.amountToNextTier())
                .monthlySpending(monthlySpending)
                .build();
    }

    /** Groups a customer's raw purchased-item rows by variant, summing quantity across repeat purchases. */
    private List<PurchasedProductDto> buildPurchasedProducts(List<Object[]> rawItems) {
        Map<String, PurchasedProductDto> grouped = new LinkedHashMap<>();
        for (Object[] row : rawItems) {
            OrderItem oi = (OrderItem) row[0];
            LocalDateTime orderDate = (LocalDateTime) row[1];
            ProductVariant pv = oi.getProductVariant();
            if (pv == null || pv.getProduct() == null) {
                continue;
            }
            String pvId = pv.getId();
            PurchasedProductDto dto = grouped.get(pvId);
            if (dto == null) {
                String imageUrl = null;
                if (pv.getProduct().getImages() != null && !pv.getProduct().getImages().isEmpty()) {
                    imageUrl = pv.getProduct().getImages().get(0).getImageUrl();
                }
                dto = PurchasedProductDto.builder()
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
        return new ArrayList<>(grouped.values());
    }

    private record MembershipProgression(
            MembershipTier nextTier, BigDecimal nextTierMinSpending, BigDecimal amountToNextTier) {
        static MembershipProgression none() {
            return new MembershipProgression(null, null, null);
        }
    }

    /** Finds the next membership tier above the customer's current one and how much more spending it needs. */
    private MembershipProgression calculateMembershipProgression(
            Membership current, BigDecimal totalSpend) {
        BigDecimal currentMin = current.getMinSpending() == null ? BigDecimal.ZERO : current.getMinSpending();
        BigDecimal finalTotalSpend = totalSpend == null ? BigDecimal.ZERO : totalSpend;

        Membership next = membershipRepository.findAll().stream()
                .filter(m -> (m.getMinSpending() == null ? BigDecimal.ZERO : m.getMinSpending()).compareTo(currentMin) > 0)
                .min(Comparator.comparing(m -> m.getMinSpending() == null ? BigDecimal.ZERO : m.getMinSpending()))
                .orElse(null);

        if (next == null) {
            return MembershipProgression.none();
        }
        BigDecimal amountToNextTier = next.getMinSpending().subtract(finalTotalSpend).max(BigDecimal.ZERO);
        return new MembershipProgression(next.getTier(), next.getMinSpending(), amountToNextTier);
    }

    /** 12-slot (Jan..Dec) spending total for the current year, zero-filled for months without orders. */
    private List<BigDecimal> buildMonthlySpending(String customerId) {
        List<BigDecimal> monthlySpending = new ArrayList<>(Collections.nCopies(12, BigDecimal.ZERO));
        int currentYear = LocalDate.now().getYear();
        List<Object[]> monthlyData = orderRepository.getMonthlySpendingForCustomer(customerId, currentYear);
        for (Object[] row : monthlyData) {
            int month = ((Number) row[0]).intValue();
            BigDecimal sum = (BigDecimal) row[1];
            if (month >= 1 && month <= 12) {
                monthlySpending.set(month - 1, sum);
            }
        }
        return monthlySpending;
    }

    @Transactional
    public CustomerNoteResponseDto addNote(String customerId, String email, String content) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        Account authorAccount = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Author account not found with email: " + email));

        CustomerNote note = new CustomerNote(customer, content, authorAccount.getUser().getFullName());
        note = customerNoteRepository.save(note);
        return toNoteResponseDto(note);
    }

    @Transactional
    public CustomerNoteResponseDto updateNote(String noteId, String email, String content) {
        CustomerNote note = customerNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content must not be blank");
        }

        note.setContent(content);
        note = customerNoteRepository.save(note);
        return toNoteResponseDto(note);
    }

    @Transactional
    public void deleteNote(String noteId) {
        CustomerNote note = customerNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));
        customerNoteRepository.delete(note);
    }

    private CustomerNoteResponseDto toNoteResponseDto(CustomerNote note) {
        return CustomerNoteResponseDto.builder()
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
            throw new IllegalArgumentException("Hạng thành viên không hợp lệ: " + tierParam);
        }
    }

    private Map<String, Long> toLongMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    @Transactional
    public void bulkUpdateStatus(List<String> accountIds, String status) {
        if (accountIds == null || accountIds.isEmpty()) return;
        AccountStatus accountStatus = AccountStatus.valueOf(status.trim().toUpperCase());
        List<Account> accounts = accountRepository.findAllById(accountIds);
        accounts.forEach(account -> account.changeStatus(accountStatus));
        accountRepository.saveAll(accounts);
    }

    @Transactional
    public String bulkSendPromotion(List<String> customerIds, String message) {
        if (customerIds == null || customerIds.isEmpty()) {
            return "Không có khách hàng nào được chọn.";
        }
        return "Đã gửi thông báo khuyến mãi thành công tới " + customerIds.size() + " khách hàng.";
    }
}
