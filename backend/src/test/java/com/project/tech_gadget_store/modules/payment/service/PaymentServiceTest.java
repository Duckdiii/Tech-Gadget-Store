package com.project.tech_gadget_store.modules.payment.service;

import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.config.PaymentProperties;
import com.project.tech_gadget_store.config.VNPayProperties;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.entity.User;
import com.project.tech_gadget_store.modules.auth.repository.AddressRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.auth.service.CustomerService;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.payment.entity.CODPaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.MomoPaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.entity.VNPayPaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.modules.payment.repository.CODPaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.repository.MomoPaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.repository.PaymentLogRepository;
import com.project.tech_gadget_store.modules.payment.repository.VNPayPaymentMethodRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import tools.jackson.databind.ObjectMapper;




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
    @Mock private CustomerService customerService;
    @Mock private JdbcTemplate jdbcTemplate;

    // Cấu hình thật (không mock) vì PaymentService giờ chọn config qua momoProps.active(...) /
    // vnpayProps.active(...) — mock trực tiếp các getter cũ không còn phản ánh đúng luồng đó.
    private final MomoProperties momoProps = new MomoProperties();
    private final VNPayProperties vnpayProps = new VNPayProperties();
    private final PaymentProperties paymentProps = new PaymentProperties();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentLogRepository, momoMethodRepository, vnpayMethodRepository,
                codMethodRepository, orderRepository, customerRepository, addressRepository,
                productVariantRepository, bundleServiceRepository, momoProps, vnpayProps, paymentProps,
                customerService, objectMapper, jdbcTemplate);
    }

    @Test
    void init_dropsConstraintAndInitializesMethods() {
        momoProps.getSandbox().setPartnerCode("MOMO");
        momoProps.getSandbox().setAccessKey("ACCESS");
        momoProps.getSandbox().setEndpoint("ENDPOINT");
        momoProps.getSandbox().setRedirectUrl("REDIRECT");
        momoProps.getSandbox().setIpnUrl("IPN");
        vnpayProps.getSandbox().setTmnCode("TMN");
        vnpayProps.getSandbox().setPaymentUrl("PAY");
        vnpayProps.getSandbox().setReturnUrl("RETURN");
        vnpayProps.getSandbox().setHashSecret("SECRET");
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
        PaymentLog oldLog = mock(PaymentLog.class);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
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
