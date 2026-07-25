package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerDetailResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerListStatsDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerPageResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.PurchasedProductDto;
import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.entity.CustomerNote;
import com.project.tech_gadget_store.modules.auth.entity.User;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerNoteRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.mapper.InvoiceMapper;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerManagementServiceTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private InvoiceMapper invoiceMapper;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private CustomerNoteRepository customerNoteRepository;
    @Mock
    private MembershipRepository membershipRepository;

    @InjectMocks
    private CustomerManagementService service;

    // -------------------------------------------------------------------------
    // listCustomers
    // -------------------------------------------------------------------------

    @Test
    void listCustomers_mapsRowsToSummaryDto() {
        Customer customer = mock(Customer.class);
        Account account = mock(Account.class);
        Membership membership = mock(Membership.class);
        when(customer.getId()).thenReturn("cust-1");
        when(customer.getFullName()).thenReturn("Alice");
        when(customer.getAccount()).thenReturn(account);
        when(customer.getPhone()).thenReturn("0900000000");
        when(customer.getMembership()).thenReturn(membership);
        when(customer.getCreatedAt()).thenReturn(LocalDateTime.of(2026, 1, 1, 0, 0));
        when(account.getEmail()).thenReturn("alice@test.com");
        when(account.getId()).thenReturn("acc-1");
        when(account.getStatus()).thenReturn(AccountStatus.ACTIVE);
        when(membership.getTier()).thenReturn(MembershipTier.SILVER);

        Object[] row = new Object[] { customer, 5L, new BigDecimal("1000000") };
        Page<Object[]> page = new PageImpl<>(List.<Object[]>of(row));
        when(customerRepository.searchCustomers(any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        CustomerPageResponseDto result = service.listCustomers(
                null, null, null, null, null, null, null, "createdAt", "desc", 0, 20);

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getId()).isEqualTo("cust-1");
        assertThat(result.getItems().get(0).getEmail()).isEqualTo("alice@test.com");
        assertThat(result.getItems().get(0).getTotalOrders()).isEqualTo(5L);
        assertThat(result.getItems().get(0).getTotalSpend()).isEqualByComparingTo("1000000");
    }

    @Test
    void listCustomers_nullOrderCountAndSpend_defaultToZero() {
        Customer customer = mock(Customer.class);
        Account account = mock(Account.class);
        Membership membership = mock(Membership.class);
        when(customer.getAccount()).thenReturn(account);
        when(customer.getMembership()).thenReturn(membership);
        when(account.getStatus()).thenReturn(AccountStatus.ACTIVE);

        Object[] row = new Object[] { customer, null, null };
        when(customerRepository.searchCustomers(any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.<Object[]>of(row)));

        CustomerPageResponseDto result = service.listCustomers(
                null, null, null, null, null, null, null, "createdAt", "desc", 0, 20);

        assertThat(result.getItems().get(0).getTotalOrders()).isZero();
        assertThat(result.getItems().get(0).getTotalSpend()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void listCustomers_invalidTier_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> service.listCustomers(
                null, "NOT_A_TIER", null, null, null, null, null, "createdAt", "desc", 0, 20))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void listCustomers_invalidJoinDate_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> service.listCustomers(
                null, null, "not-a-date", null, null, null, null, "createdAt", "desc", 0, 20))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void listCustomers_sortByTotalOrders_buildsPageableWithThatProperty() {
        when(customerRepository.searchCustomers(any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.listCustomers(null, null, null, null, null, null, null, "totalOrders", "asc", 0, 20);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(customerRepository).searchCustomers(any(), any(), any(), any(), any(), any(), any(), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getSort().getOrderFor("totalOrders")).isNotNull();
        assertThat(pageableCaptor.getValue().getSort().getOrderFor("totalOrders").isAscending()).isTrue();
    }

    // -------------------------------------------------------------------------
    // getCustomerDetail
    // -------------------------------------------------------------------------

    @Test
    void getCustomerDetail_notFound_throwsResourceNotFoundException() {
        when(customerRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getCustomerDetail("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCustomerDetail_success_groupsPurchasedItemsAndComputesNextTier() {
        Customer customer = mock(Customer.class);
        Account account = mock(Account.class);
        Address address = mock(Address.class);
        Membership silver = mock(Membership.class);
        Membership gold = mock(Membership.class);

        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(customer));
        when(customer.getId()).thenReturn("cust-1");
        when(customer.getFullName()).thenReturn("Alice");
        when(customer.getAccount()).thenReturn(account);
        when(customer.getPhone()).thenReturn("0900000000");
        when(customer.getAddresses()).thenReturn(List.of(address));
        when(customer.getMembership()).thenReturn(silver);
        when(customer.getCreatedAt()).thenReturn(LocalDateTime.of(2025, 6, 1, 0, 0));
        when(account.getEmail()).thenReturn("alice@test.com");
        when(account.getId()).thenReturn("acc-1");
        when(account.getStatus()).thenReturn(AccountStatus.ACTIVE);
        when(address.getStreet()).thenReturn("123 Le Loi");
        when(address.getWard()).thenReturn("Ben Nghe");
        when(address.getDistrict()).thenReturn("District 1");
        when(address.getProvince()).thenReturn("HCM");

        when(orderRepository.countActiveOrdersForCustomerIds(List.of("cust-1")))
                .thenReturn(List.<Object[]>of(new Object[] { "cust-1", 3L }));
        when(orderRepository.sumSpentByCustomerIdAndStatus("cust-1", OrderStatus.COMPLETED))
                .thenReturn(new BigDecimal("12000000"));
        when(orderRepository.countRefundedOrdersByCustomerId("cust-1")).thenReturn(1L);

        Order recentOrder = mock(Order.class);
        LocalDateTime lastPurchase = LocalDateTime.of(2026, 1, 10, 10, 0);
        when(recentOrder.getOrderDate()).thenReturn(lastPurchase);
        when(recentOrder.getItems()).thenReturn(null);
        when(orderRepository.findOrdersCursor(eq("cust-1"), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(List.of(recentOrder));

        // Two purchased-item rows referencing the SAME variant -> quantities must be summed.
        ProductVariant variant = mock(ProductVariant.class);
        Product product = mock(Product.class);
        when(variant.getId()).thenReturn("pv-1");
        when(variant.getProduct()).thenReturn(product);
        when(variant.getDisplayName()).thenReturn("8GB/256GB - Đen");
        when(product.getId()).thenReturn("prod-1");
        when(product.getName()).thenReturn("iPhone 15");
        when(product.getImages()).thenReturn(null);

        OrderItem item1 = mock(OrderItem.class);
        when(item1.getProductVariant()).thenReturn(variant);
        when(item1.getQuantity()).thenReturn(1);
        OrderItem item2 = mock(OrderItem.class);
        when(item2.getProductVariant()).thenReturn(variant);
        when(item2.getQuantity()).thenReturn(2);

        LocalDateTime firstDate = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime secondDate = LocalDateTime.of(2026, 1, 5, 0, 0);
        when(orderRepository.findAllPurchasedItemsWithDate("cust-1")).thenReturn(List.of(
                new Object[] { item1, firstDate },
                new Object[] { item2, secondDate }));

        CustomerNote note = mock(CustomerNote.class);
        when(note.getId()).thenReturn("note-1");
        when(note.getContent()).thenReturn("VIP customer");
        when(note.getAuthorName()).thenReturn("Manager Bob");
        when(customerNoteRepository.findByCustomerIdOrderByCreatedAtDesc("cust-1")).thenReturn(List.of(note));

        when(silver.getMinSpending()).thenReturn(new BigDecimal("5000000"));
        when(silver.getMaxSpending()).thenReturn(new BigDecimal("20000000"));
        when(silver.getTier()).thenReturn(MembershipTier.SILVER);
        when(gold.getMinSpending()).thenReturn(new BigDecimal("20000000"));
        when(gold.getTier()).thenReturn(MembershipTier.GOLD);
        when(membershipRepository.findAll()).thenReturn(List.of(silver, gold));

        when(orderRepository.getMonthlySpendingForCustomer(eq("cust-1"), anyInt()))
                .thenReturn(List.<Object[]>of(new Object[] { 3, new BigDecimal("500000") }));

        CustomerDetailResponseDto result = service.getCustomerDetail("cust-1");

        assertThat(result.getId()).isEqualTo("cust-1");
        assertThat(result.getEmail()).isEqualTo("alice@test.com");
        assertThat(result.getAddress()).isEqualTo("123 Le Loi, Ben Nghe, District 1, HCM");
        assertThat(result.getTotalOrders()).isEqualTo(3L);
        assertThat(result.getReturnedOrders()).isEqualTo(1L);
        assertThat(result.getLastPurchaseDate()).isEqualTo(lastPurchase);

        assertThat(result.getPurchasedProducts()).hasSize(1);
        PurchasedProductDto purchased = result.getPurchasedProducts().get(0);
        assertThat(purchased.getProductId()).isEqualTo("prod-1");
        assertThat(purchased.getQuantity()).isEqualTo(3); // 1 + 2 summed across the two rows
        assertThat(purchased.getProductImageUrl()).isNull();

        assertThat(result.getNotes()).hasSize(1);
        assertThat(result.getNotes().get(0).getContent()).isEqualTo("VIP customer");

        assertThat(result.getNextTier()).isEqualTo(MembershipTier.GOLD);
        assertThat(result.getAmountToNextTier()).isEqualByComparingTo("8000000"); // 20M - 12M spent

        assertThat(result.getMonthlySpending()).hasSize(12);
        assertThat(result.getMonthlySpending().get(2)).isEqualByComparingTo("500000"); // month=3 -> index 2
        assertThat(result.getMonthlySpending().get(0)).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void getCustomerDetail_noAddresses_addressIsNull() {
        Customer customer = mock(Customer.class);
        Account account = mock(Account.class);
        Membership membership = mock(Membership.class);
        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(customer));
        when(customer.getAccount()).thenReturn(account);
        when(customer.getAddresses()).thenReturn(List.of());
        when(customer.getMembership()).thenReturn(membership);
        when(account.getStatus()).thenReturn(AccountStatus.ACTIVE);
        when(membership.getMinSpending()).thenReturn(BigDecimal.ZERO);
        when(orderRepository.findOrdersCursor(any(), any(), any(), any(), any(Pageable.class))).thenReturn(List.of());
        when(orderRepository.findAllPurchasedItemsWithDate("cust-1")).thenReturn(List.of());
        when(membershipRepository.findAll()).thenReturn(List.of(membership));
        when(orderRepository.getMonthlySpendingForCustomer(eq("cust-1"), anyInt())).thenReturn(List.of());

        CustomerDetailResponseDto result = service.getCustomerDetail("cust-1");

        assertThat(result.getAddress()).isNull();
        assertThat(result.getLastPurchaseDate()).isNull();
        assertThat(result.getNextTier()).isNull();
    }

    // -------------------------------------------------------------------------
    // Notes
    // -------------------------------------------------------------------------

    @Test
    void addNote_success_returnsMappedNote() {
        Customer customer = mock(Customer.class);
        Account account = mock(Account.class);
        User authorUser = mock(User.class);
        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(customer));
        when(accountRepository.findByEmail("manager@test.com")).thenReturn(Optional.of(account));
        when(account.getUser()).thenReturn(authorUser);
        when(authorUser.getFullName()).thenReturn("Manager Bob");

        CustomerNote saved = mock(CustomerNote.class);
        when(saved.getId()).thenReturn("note-1");
        when(saved.getContent()).thenReturn("Hello");
        when(saved.getAuthorName()).thenReturn("Manager Bob");
        when(customerNoteRepository.save(any(CustomerNote.class))).thenReturn(saved);

        CustomerNoteResponseDto result = service.addNote("cust-1", "manager@test.com", "Hello");

        assertThat(result.getId()).isEqualTo("note-1");
        assertThat(result.getContent()).isEqualTo("Hello");
        assertThat(result.getAuthorName()).isEqualTo("Manager Bob");
    }

    @Test
    void addNote_customerNotFound_throwsResourceNotFoundException() {
        when(customerRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.addNote("missing", "manager@test.com", "Hello"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addNote_authorAccountNotFound_throwsResourceNotFoundException() {
        Customer customer = mock(Customer.class);
        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(customer));
        when(accountRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.addNote("cust-1", "missing@test.com", "Hello"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateNote_success_updatesContent() {
        CustomerNote note = mock(CustomerNote.class);
        when(customerNoteRepository.findById("note-1")).thenReturn(Optional.of(note));
        when(customerNoteRepository.save(note)).thenReturn(note);
        when(note.getId()).thenReturn("note-1");
        when(note.getContent()).thenReturn("Updated content");

        CustomerNoteResponseDto result = service.updateNote("note-1", "manager@test.com", "Updated content");

        verify(note).setContent("Updated content");
        assertThat(result.getContent()).isEqualTo("Updated content");
    }

    @Test
    void updateNote_notFound_throwsResourceNotFoundException() {
        when(customerNoteRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateNote("missing", "manager@test.com", "New content"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateNote_blankContent_throwsIllegalArgumentException() {
        CustomerNote note = mock(CustomerNote.class);
        when(customerNoteRepository.findById("note-1")).thenReturn(Optional.of(note));

        assertThatThrownBy(() -> service.updateNote("note-1", "manager@test.com", "  "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deleteNote_success_deletesNote() {
        CustomerNote note = mock(CustomerNote.class);
        when(customerNoteRepository.findById("note-1")).thenReturn(Optional.of(note));

        service.deleteNote("note-1");

        verify(customerNoteRepository).delete(note);
    }

    @Test
    void deleteNote_notFound_throwsResourceNotFoundException() {
        when(customerNoteRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteNote("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // getStatsSummary
    // -------------------------------------------------------------------------

    @Test
    void getStatsSummary_computesRetentionRate() {
        when(customerRepository.count()).thenReturn(10L);
        when(customerRepository.countByCreatedAtBetween(any(), any())).thenReturn(2L);
        when(customerRepository.countByMembershipTierIn(anyList())).thenReturn(4L);
        when(orderRepository.findRepeatCustomerIds()).thenReturn(List.of("c1", "c2", "c3"));

        CustomerListStatsDto result = service.getStatsSummary();

        assertThat(result.getTotalCustomers()).isEqualTo(10L);
        assertThat(result.getNewThisMonth()).isEqualTo(2L);
        assertThat(result.getVipCustomers()).isEqualTo(4L);
        assertThat(result.getRetentionRate()).isEqualTo(30.0);
    }

    @Test
    void getStatsSummary_zeroCustomers_retentionRateIsZero() {
        when(customerRepository.count()).thenReturn(0L);
        when(customerRepository.countByCreatedAtBetween(any(), any())).thenReturn(0L);
        when(customerRepository.countByMembershipTierIn(anyList())).thenReturn(0L);
        when(orderRepository.findRepeatCustomerIds()).thenReturn(List.of());

        CustomerListStatsDto result = service.getStatsSummary();

        assertThat(result.getRetentionRate()).isZero();
    }

    // -------------------------------------------------------------------------
    // bulkUpdateStatus / bulkSendPromotion
    // -------------------------------------------------------------------------

    @Test
    void bulkUpdateStatus_emptyList_doesNothing() {
        service.bulkUpdateStatus(List.of(), "BLOCKED");

        verifyNoInteractions(accountRepository);
    }

    @Test
    void bulkUpdateStatus_updatesFoundAccounts_skipsMissingOnes() {
        Account found = mock(Account.class);
        when(accountRepository.findAllById(List.of("acc-1", "acc-missing"))).thenReturn(List.of(found));

        service.bulkUpdateStatus(List.of("acc-1", "acc-missing"), "blocked");

        verify(found).changeStatus(AccountStatus.BLOCKED);
        verify(accountRepository).saveAll(List.of(found));
    }

    @Test
    void bulkSendPromotion_emptyList_returnsNoCustomerSelectedMessage() {
        String result = service.bulkSendPromotion(List.of(), "Sale 50%");

        assertThat(result).isEqualTo("Không có khách hàng nào được chọn.");
    }

    @Test
    void bulkSendPromotion_nonEmptyList_returnsCountInMessage() {
        String result = service.bulkSendPromotion(List.of("c1", "c2", "c3"), "Sale 50%");

        assertThat(result).contains("3");
    }
}
