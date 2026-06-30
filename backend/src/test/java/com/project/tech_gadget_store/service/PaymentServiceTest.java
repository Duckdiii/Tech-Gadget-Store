package com.project.tech_gadget_store.service;

import tools.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.config.VNPayProperties;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    private PaymentService paymentService;

    @Mock private PaymentLogRepository paymentLogRepository;
    @Mock private MomoPaymentMethodRepository momoMethodRepository;
    @Mock private VNPayPaymentMethodRepository vnpayMethodRepository;
    @Mock private CODPaymentMethodRepository codMethodRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private ProductVariantRepository productVariantRepository;
    @Mock private BundleServiceRepository bundleServiceRepository;
    @Mock private MomoProperties momoProps;
    @Mock private VNPayProperties vnpayProps;
    @Mock private CustomerService customerService;
    @Mock private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentLogRepository, momoMethodRepository, vnpayMethodRepository,
                codMethodRepository, orderRepository, customerRepository, addressRepository,
                productVariantRepository, bundleServiceRepository, momoProps, vnpayProps,
                customerService, objectMapper, jdbcTemplate);
    }

    @Test
    void init_dropsConstraintAndInitializesMethods() {
        when(momoProps.getPartnerCode()).thenReturn("MOMO");
        when(momoProps.getAccessKey()).thenReturn("ACCESS");
        when(momoProps.getEndpoint()).thenReturn("ENDPOINT");
        when(momoProps.getRedirectUrl()).thenReturn("REDIRECT");
        when(momoProps.getIpnUrl()).thenReturn("IPN");
        when(vnpayProps.getTmnCode()).thenReturn("TMN");
        when(vnpayProps.getPaymentUrl()).thenReturn("PAY");
        when(vnpayProps.getReturnUrl()).thenReturn("RETURN");
        when(vnpayProps.getHashSecret()).thenReturn("SECRET");
        when(momoMethodRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.empty());
        when(vnpayMethodRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.empty());
        when(codMethodRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.empty());

        paymentService.init();

        verify(jdbcTemplate).execute("ALTER TABLE payment_logs ALTER COLUMN order_id DROP NOT NULL;");
        verify(momoMethodRepository).save(any(MomoPaymentMethod.class));
        verify(vnpayMethodRepository).save(any(VNPayPaymentMethod.class));
        verify(codMethodRepository).save(any(CODPaymentMethod.class));
    }

    @Test
    void createPendingLog_createsNewAndCancelsOld() {
        String orderId = "order-1";
        Order order = mock(Order.class);
        MomoPaymentMethod momoMethod = mock(MomoPaymentMethod.class);
        PaymentLog oldLog = mock(PaymentLog.class);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(momoMethodRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(momoMethod));
        when(paymentLogRepository.findFirstByOrderIdAndStatus(orderId, PaymentLogStatus.PENDING))
                .thenReturn(Optional.of(oldLog));
        when(paymentLogRepository.save(any(PaymentLog.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentLog result = paymentService.createPendingLog(orderId, BigDecimal.valueOf(100000), true);

        assertNotNull(result);
        assertEquals(order, result.getOrder());
        assertEquals(BigDecimal.valueOf(100000), result.getAmount());
        assertEquals(PaymentLogStatus.PENDING, result.getStatus());
        verify(oldLog).markFailed("Thay thế bởi lần thử thanh toán mới");
    }

    @Test
    void createPendingOnlineLog_createsSuccess() {
        when(paymentLogRepository.save(any(PaymentLog.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentLog result = paymentService.createPendingOnlineLog(BigDecimal.valueOf(250000));

        assertNotNull(result);
        assertNull(result.getOrder());
        assertEquals(BigDecimal.valueOf(250000), result.getAmount());
        assertEquals(PaymentLogStatus.PENDING, result.getStatus());
    }

    @Test
    void markSuccess_withOrder_savesAndRecalculates() {
        String logId = "log-1";
        PaymentLog logRecord = mock(PaymentLog.class);
        Order order = mock(Order.class);
        Customer customer = mock(Customer.class);

        when(paymentLogRepository.findById(logId)).thenReturn(Optional.of(logRecord));
        when(logRecord.getStatus()).thenReturn(PaymentLogStatus.PENDING);
        when(logRecord.getOrder()).thenReturn(order);
        when(order.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn("cust-1");
        when(order.isPaid()).thenReturn(false);

        paymentService.markSuccess(logId, "txn-123");

        verify(logRecord).markSuccess();
        verify(paymentLogRepository).save(logRecord);
        verify(order).markPaid();
        verify(orderRepository).save(order);
        verify(customerService).recalculateMembership("cust-1");
    }

    @Test
    void markFailed_updatesStatus() {
        String logId = "log-3";
        PaymentLog logRecord = mock(PaymentLog.class);
        when(paymentLogRepository.findById(logId)).thenReturn(Optional.of(logRecord));
        when(logRecord.getStatus()).thenReturn(PaymentLogStatus.PENDING);

        paymentService.markFailed(logId, "User cancelled");

        verify(logRecord).setStatus(PaymentLogStatus.CANCELLED);
        verify(logRecord).setFailureReason("User cancelled");
        verify(paymentLogRepository).save(logRecord);
    }
}
