package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.InvoiceResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.mapper.InvoiceMapper;
import com.project.tech_gadget_store.repository.InvoiceRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private InvoiceMapper invoiceMapper;

    @InjectMocks
    private InvoiceService invoiceService;

    private Order order;
    private Customer customer;
    private Account account;
    private Membership membership;
    private MembershipBenefit benefit;

    @BeforeEach
    void setUp() {
        order = mock(Order.class);
        customer = mock(Customer.class);
        account = mock(Account.class);
        membership = mock(Membership.class);
        benefit = mock(MembershipBenefit.class);
    }

    @Test
    void getOrCreateInvoice_OrderNotFound_ThrowsResponseStatusException() {
        when(orderRepository.findById("invalid-id")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                invoiceService.getOrCreateInvoice("invalid-id", "user@example.com"));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Đơn hàng không tồn tại"));
    }

    @Test
    void getOrCreateInvoice_AccessDenied_ThrowsResponseStatusException() {
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(order.getCustomer()).thenReturn(customer);
        when(customer.getAccount()).thenReturn(account);
        when(account.getEmail()).thenReturn("owner@example.com");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                invoiceService.getOrCreateInvoice("order-1", "stranger@example.com"));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Bạn không có quyền xem hoá đơn này"));
    }

    @Test
    void getOrCreateInvoice_OrderCancelled_ThrowsResponseStatusException() {
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(order.getCustomer()).thenReturn(customer);
        when(customer.getAccount()).thenReturn(account);
        when(account.getEmail()).thenReturn("owner@example.com");
        when(order.getOrderStatus()).thenReturn(OrderStatus.CANCELLED);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                invoiceService.getOrCreateInvoice("order-1", "owner@example.com"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Không thể xuất hoá đơn cho đơn hàng đã huỷ"));
    }

    @Test
    void getOrCreateInvoice_InvoiceAlreadyExists_ReturnsExistingInvoice() {
        Invoice invoice = mock(Invoice.class);
        InvoiceResponseDto responseDto = InvoiceResponseDto.builder().build();

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(order.getCustomer()).thenReturn(customer);
        when(customer.getAccount()).thenReturn(account);
        when(account.getEmail()).thenReturn("owner@example.com");
        when(order.getOrderStatus()).thenReturn(OrderStatus.COMPLETED);
        when(invoiceRepository.findByOrderId("order-1")).thenReturn(Optional.of(invoice));
        when(invoiceMapper.toInvoiceResponseDto(invoice)).thenReturn(responseDto);

        InvoiceResponseDto result = invoiceService.getOrCreateInvoice("order-1", "owner@example.com");

        assertNotNull(result);
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    void getOrCreateInvoice_InvoiceDoesNotExist_CreatesAndSavesInvoice() {
        InvoiceResponseDto responseDto = InvoiceResponseDto.builder().build();

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(order.getCustomer()).thenReturn(customer);
        when(customer.getAccount()).thenReturn(account);
        when(account.getEmail()).thenReturn("owner@example.com");
        when(order.getOrderStatus()).thenReturn(OrderStatus.COMPLETED);
        when(invoiceRepository.findByOrderId("order-1")).thenReturn(Optional.empty());

        // Calculation mocks
        when(order.calculateSubtotal()).thenReturn(new BigDecimal("1000000.00"));
        when(customer.getMembership()).thenReturn(membership);
        when(membership.getBenefit()).thenReturn(benefit);
        when(benefit.calculateDiscount(any())).thenReturn(new BigDecimal("100000.00")); // 10% discount

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceMapper.toInvoiceResponseDto(any(Invoice.class))).thenReturn(responseDto);

        InvoiceResponseDto result = invoiceService.getOrCreateInvoice("order-1", "owner@example.com");

        assertNotNull(result);
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }
}
