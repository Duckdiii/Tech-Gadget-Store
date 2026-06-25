package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PaymentLogFilterRequestDto;
import com.project.tech_gadget_store.dto.response.PaymentLogResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.exception.PaymentLogLoadException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.PaymentLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentLogServiceTest {

    @Mock
    private PaymentLogRepository paymentLogRepository;

    @InjectMocks
    private PaymentLogService paymentLogService;

    private PaymentLog momoLog;
    private PaymentLog vnpayLog;
    private PaymentLog codLog;

    void setUpMocks() {
        // Mock Customers and Accounts
        Customer cust1 = mock(Customer.class);
        Account acc1 = mock(Account.class);
        lenient().when(cust1.getFullName()).thenReturn("John Doe");
        lenient().when(cust1.getPhone()).thenReturn("0987654321");
        lenient().when(cust1.getAccount()).thenReturn(acc1);
        lenient().when(acc1.getEmail()).thenReturn("john.doe@example.com");

        Customer cust2 = mock(Customer.class);
        lenient().when(cust2.getFullName()).thenReturn("Jane Smith");
        lenient().when(cust2.getPhone()).thenReturn("0123456789");
        lenient().when(cust2.getAccount()).thenReturn(null); // No account

        // Mock Orders
        Order order1 = mock(Order.class);
        lenient().when(order1.getId()).thenReturn("order-1");
        lenient().when(order1.getCustomer()).thenReturn(cust1);

        Order order2 = mock(Order.class);
        lenient().when(order2.getId()).thenReturn("order-2");
        lenient().when(order2.getCustomer()).thenReturn(cust2);

        Order order3 = mock(Order.class);
        lenient().when(order3.getId()).thenReturn("order-3");
        lenient().when(order3.getCustomer()).thenReturn(cust1);

        // Mock PaymentMethods
        MomoPaymentMethod momo = mock(MomoPaymentMethod.class);
        lenient().when(momo.getName()).thenReturn("Ví MoMo");
        lenient().when(momo.getPartnerCode()).thenReturn("MOMO123");
        lenient().when(momo.getMerchantId()).thenReturn("MERCH123");
        lenient().when(momo.getEndpointUrl()).thenReturn("https://momo.vn");

        VNPayPaymentMethod vnpay = mock(VNPayPaymentMethod.class);
        lenient().when(vnpay.getName()).thenReturn("VNPay");
        lenient().when(vnpay.getTerminalCode()).thenReturn("VNP123");
        lenient().when(vnpay.getEndpointUrl()).thenReturn("https://vnpay.vn");

        CODPaymentMethod cod = mock(CODPaymentMethod.class);
        lenient().when(cod.getName()).thenReturn("Thanh toán khi nhận hàng (COD)");
        lenient().when(cod.getMaxAmount()).thenReturn(BigDecimal.valueOf(5000000));
        lenient().when(cod.getServiceFee()).thenReturn(BigDecimal.valueOf(20000));

        // Mock PaymentLogs
        momoLog = mock(PaymentLog.class);
        lenient().when(momoLog.getId()).thenReturn("log-momo");
        lenient().when(momoLog.getOrder()).thenReturn(order1);
        lenient().when(momoLog.getAmount()).thenReturn(BigDecimal.valueOf(150000));
        lenient().when(momoLog.getPaymentMethod()).thenReturn(momo);
        lenient().when(momoLog.getStatus()).thenReturn(PaymentLogStatus.SUCCESS);
        lenient().when(momoLog.getCreatedAt()).thenReturn(LocalDateTime.of(2026, 6, 20, 10, 0));
        lenient().when(momoLog.getPaidAt()).thenReturn(LocalDateTime.of(2026, 6, 20, 10, 5));

        vnpayLog = mock(PaymentLog.class);
        lenient().when(vnpayLog.getId()).thenReturn("log-vnpay");
        lenient().when(vnpayLog.getOrder()).thenReturn(order2);
        lenient().when(vnpayLog.getAmount()).thenReturn(BigDecimal.valueOf(350000));
        lenient().when(vnpayLog.getPaymentMethod()).thenReturn(vnpay);
        lenient().when(vnpayLog.getStatus()).thenReturn(PaymentLogStatus.FAILED);
        lenient().when(vnpayLog.getCreatedAt()).thenReturn(LocalDateTime.of(2026, 6, 21, 14, 0));
        lenient().when(vnpayLog.getFailureReason()).thenReturn("User cancelled transaction");

        codLog = mock(PaymentLog.class);
        lenient().when(codLog.getId()).thenReturn("log-cod");
        lenient().when(codLog.getOrder()).thenReturn(order3);
        lenient().when(codLog.getAmount()).thenReturn(BigDecimal.valueOf(200000));
        lenient().when(codLog.getPaymentMethod()).thenReturn(cod);
        lenient().when(codLog.getStatus()).thenReturn(PaymentLogStatus.PENDING);
        lenient().when(codLog.getCreatedAt()).thenReturn(LocalDateTime.of(2026, 6, 22, 9, 0));
    }

    @Test
    void getPaymentLogs_AllLogs_SuccessSortedDescending() {
        setUpMocks();
        when(paymentLogRepository.findAll()).thenReturn(List.of(momoLog, vnpayLog, codLog));

        PaymentLogFilterRequestDto filter = PaymentLogFilterRequestDto.builder().build();
        List<PaymentLogResponseDto> response = paymentLogService.getPaymentLogs(filter);

        assertNotNull(response);
        assertEquals(3, response.size());

        // Order is descending by createdAt (codLog -> vnpayLog -> momoLog)
        assertEquals("log-cod", response.get(0).getId());
        assertEquals("log-vnpay", response.get(1).getId());
        assertEquals("log-momo", response.get(2).getId());

        // Verify fields on first element
        PaymentLogResponseDto first = response.get(0);
        assertEquals("order-3", first.getOrderId());
        assertEquals("John Doe", first.getCustomerName());
        assertEquals("0987654321", first.getCustomerPhone());
        assertEquals("john.doe@example.com", first.getCustomerEmail());
        assertEquals(BigDecimal.valueOf(200000), first.getAmount());
        assertEquals("Thanh toán khi nhận hàng (COD)", first.getPaymentMethod());
        assertEquals("COD", first.getPaymentMethodType());
        assertEquals("PENDING", first.getStatus());
        assertNull(first.getPaidTime());
    }

    @Test
    void getPaymentLogs_FilterByDateRange_Success() {
        setUpMocks();
        when(paymentLogRepository.findAll()).thenReturn(List.of(momoLog, vnpayLog, codLog));

        PaymentLogFilterRequestDto filter = PaymentLogFilterRequestDto.builder()
                .startDate("2026-06-20")
                .endDate("2026-06-21")
                .build();
        List<PaymentLogResponseDto> response = paymentLogService.getPaymentLogs(filter);

        assertNotNull(response);
        assertEquals(2, response.size());
        assertEquals("log-vnpay", response.get(0).getId());
        assertEquals("log-momo", response.get(1).getId());
    }

    @Test
    void getPaymentLogs_FilterByStatus_Success() {
        setUpMocks();
        when(paymentLogRepository.findAll()).thenReturn(List.of(momoLog, vnpayLog, codLog));

        PaymentLogFilterRequestDto filter = PaymentLogFilterRequestDto.builder()
                .status("FAILED")
                .build();
        List<PaymentLogResponseDto> response = paymentLogService.getPaymentLogs(filter);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("log-vnpay", response.get(0).getId());
    }

    @Test
    void getPaymentLogs_FilterByPaymentMethodType_Success() {
        setUpMocks();
        when(paymentLogRepository.findAll()).thenReturn(List.of(momoLog, vnpayLog, codLog));

        // Filter by MOMO type
        PaymentLogFilterRequestDto filterType = PaymentLogFilterRequestDto.builder()
                .paymentMethod("MOMO")
                .build();
        List<PaymentLogResponseDto> responseType = paymentLogService.getPaymentLogs(filterType);

        assertEquals(1, responseType.size());
        assertEquals("log-momo", responseType.get(0).getId());

        // Filter by partial name match "Thanh toán"
        PaymentLogFilterRequestDto filterName = PaymentLogFilterRequestDto.builder()
                .paymentMethod("Thanh toán")
                .build();
        List<PaymentLogResponseDto> responseName = paymentLogService.getPaymentLogs(filterName);

        assertEquals(1, responseName.size());
        assertEquals("log-cod", responseName.get(0).getId());
    }

    @Test
    void getPaymentLogs_InvalidFilterDateOrder_ThrowsIllegalArgumentException() {
        PaymentLogFilterRequestDto filter = PaymentLogFilterRequestDto.builder()
                .startDate("2026-06-25")
                .endDate("2026-06-20")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> paymentLogService.getPaymentLogs(filter));
        assertEquals("Invalid filter input. Please check your search criteria", ex.getMessage());
    }

    @Test
    void getPaymentLogs_InvalidDateFormat_ThrowsIllegalArgumentException() {
        PaymentLogFilterRequestDto filter = PaymentLogFilterRequestDto.builder()
                .startDate("invalid-date-format")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> paymentLogService.getPaymentLogs(filter));
        assertEquals("Invalid filter input. Please check your search criteria", ex.getMessage());
    }

    @Test
    void getPaymentLogs_NoRecordsFound_ThrowsNoSuchElementException() {
        when(paymentLogRepository.findAll()).thenReturn(Collections.emptyList());

        PaymentLogFilterRequestDto filter = PaymentLogFilterRequestDto.builder().build();

        NoSuchElementException ex = assertThrows(NoSuchElementException.class,
                () -> paymentLogService.getPaymentLogs(filter));
        assertEquals("No payment records found", ex.getMessage());
    }

    @Test
    void getPaymentLogs_DatabaseError_ThrowsPaymentLogLoadException() {
        when(paymentLogRepository.findAll()).thenThrow(new RuntimeException("Database down"));

        PaymentLogFilterRequestDto filter = PaymentLogFilterRequestDto.builder().build();

        PaymentLogLoadException ex = assertThrows(PaymentLogLoadException.class,
                () -> paymentLogService.getPaymentLogs(filter));
        assertEquals("Unable to load payment logs. Please try again later", ex.getMessage());
    }

    @Test
    void getPaymentLogDetails_Success() {
        setUpMocks();
        when(paymentLogRepository.findById("log-momo")).thenReturn(Optional.of(momoLog));

        PaymentLogResponseDto details = paymentLogService.getPaymentLogDetails("log-momo");

        assertNotNull(details);
        assertEquals("log-momo", details.getId());
        assertEquals("order-1", details.getOrderId());
        assertEquals("John Doe", details.getCustomerName());
        assertEquals("john.doe@example.com", details.getCustomerEmail());
        assertEquals(BigDecimal.valueOf(150000), details.getAmount());
        assertEquals("Ví MoMo", details.getPaymentMethod());
        assertEquals("MOMO", details.getPaymentMethodType());
        assertEquals("SUCCESS", details.getStatus());
        assertEquals(LocalDateTime.of(2026, 6, 20, 10, 5), details.getPaidTime());

        // Verify metadata
        assertNotNull(details.getMetadata());
        assertEquals("MOMO123", details.getMetadata().get("partnerCode"));
        assertEquals("MERCH123", details.getMetadata().get("merchantId"));
        assertEquals("https://momo.vn", details.getMetadata().get("endpointUrl"));
    }

    @Test
    void getPaymentLogDetails_NotFound_ThrowsResourceNotFoundException() {
        when(paymentLogRepository.findById("invalid-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> paymentLogService.getPaymentLogDetails("invalid-id"));
    }
}
