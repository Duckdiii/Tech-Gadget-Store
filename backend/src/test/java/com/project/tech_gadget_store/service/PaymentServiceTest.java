package com.project.tech_gadget_store.service;

import tools.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.config.VNPayProperties;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    private PaymentService paymentService;

    @Mock
    private PaymentLogRepository paymentLogRepository;
    @Mock
    private MomoPaymentMethodRepository momoMethodRepository;
    @Mock
    private VNPayPaymentMethodRepository vnpayMethodRepository;
    @Mock
    private CODPaymentMethodRepository codMethodRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private BundleServiceRepository bundleServiceRepository;
    @Mock
    private MomoProperties momoProps;
    @Mock
    private VNPayProperties vnpayProps;
    @Mock
    private CustomerService customerService;
    @Mock
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentLogRepository,
                momoMethodRepository,
                vnpayMethodRepository,
                codMethodRepository,
                orderRepository,
                customerRepository,
                addressRepository,
                productVariantRepository,
                bundleServiceRepository,
                momoProps,
                vnpayProps,
                customerService,
                objectMapper,
                jdbcTemplate
        );
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
        when(paymentLogRepository.save(any(PaymentLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal amount = BigDecimal.valueOf(100000);
        PaymentLog result = paymentService.createPendingLog(orderId, amount, true);

        assertNotNull(result);
        assertEquals(order, result.getOrder());
        assertEquals(amount, result.getAmount());
        assertEquals(momoMethod, result.getPaymentMethod());
        assertEquals(PaymentLogStatus.PENDING, result.getStatus());

        verify(oldLog).markFailed("Thay thế bởi lần thử thanh toán mới");
    }

    @Test
    void createPendingOnlineLog_createsSuccess() {
        VNPayPaymentMethod vnpayMethod = mock(VNPayPaymentMethod.class);
        when(paymentLogRepository.save(any(PaymentLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal amount = BigDecimal.valueOf(250000);
        String checkoutData = "{}";
        PaymentLog result = paymentService.createPendingOnlineLog(amount, vnpayMethod, checkoutData);

        assertNotNull(result);
        assertNull(result.getOrder());
        assertEquals(amount, result.getAmount());
        assertEquals(vnpayMethod, result.getPaymentMethod());
        assertEquals(checkoutData, result.getCheckoutData());
        assertEquals(PaymentLogStatus.PENDING, result.getStatus());
    }

    @Test
    void markSuccess_withOrder_savesAndRecalculates() {
        String logId = "log-1";
        PaymentLog logRecord = mock(PaymentLog.class);
        Order order = mock(Order.class);
        Customer customer = mock(Customer.class);
        String customerId = "cust-1";

        when(paymentLogRepository.findById(logId)).thenReturn(Optional.of(logRecord));
        when(logRecord.getStatus()).thenReturn(PaymentLogStatus.PENDING);
        when(logRecord.getOrder()).thenReturn(order);
        when(order.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(customerId);
        when(order.isPaid()).thenReturn(false);

        paymentService.markSuccess(logId, "txn-123");

        verify(logRecord).setTransactionId("txn-123");
        verify(logRecord).markSuccess();
        verify(paymentLogRepository).save(logRecord);
        verify(order).markPaid();
        verify(orderRepository).save(order);
        verify(customerService).recalculateMembership(customerId);
    }

    @Test
    void markSuccess_withoutOrder_reconstructsOrderAndClearsCart() throws Exception {
        String logId = "log-2";
        
        // Mock method
        PaymentMethod paymentMethod = mock(PaymentMethod.class);

        // Prepare checkoutData JSON
        PaymentService.CheckoutDataJson checkoutData = new PaymentService.CheckoutDataJson();
        checkoutData.customerId = "cust-123";
        checkoutData.addressId = "addr-456";

        PaymentService.CheckoutDataJson.CheckoutItemJson item = new PaymentService.CheckoutDataJson.CheckoutItemJson();
        item.productVariantId = "variant-789";
        item.quantity = 2;
        item.bundleServiceIds = List.of("service-1");
        checkoutData.items = List.of(item);

        PaymentLog logRecord = spy(new PaymentLog(null, BigDecimal.valueOf(500000), paymentMethod, PaymentLogStatus.PENDING));
        logRecord.setId(logId);
        logRecord.setCheckoutData(objectMapper.writeValueAsString(checkoutData));

        when(paymentLogRepository.findById(logId)).thenReturn(Optional.of(logRecord));

        Customer customer = mock(Customer.class);
        when(customer.getId()).thenReturn("cust-123");
        when(customerRepository.findById("cust-123")).thenReturn(Optional.of(customer));

        Address address = mock(Address.class);
        when(addressRepository.findById("addr-456")).thenReturn(Optional.of(address));

        ProductVariant variant = mock(ProductVariant.class);
        when(variant.getId()).thenReturn("variant-789");
        when(variant.getPrice()).thenReturn(BigDecimal.valueOf(200000));
        Product product = mock(Product.class);
        when(product.getId()).thenReturn("prod-1");
        when(variant.getProduct()).thenReturn(product);
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Silver");
        when(productVariantRepository.findById("variant-789")).thenReturn(Optional.of(variant));

        ProductVariant physicalUnit1 = mock(ProductVariant.class);
        ProductVariant physicalUnit2 = mock(ProductVariant.class);
        when(productVariantRepository.findAvailablePhysicalUnits("prod-1", 8, 256, "Silver"))
                .thenReturn(List.of(physicalUnit1, physicalUnit2));

        BundleService bundleService = mock(BundleService.class);
        when(bundleService.getId()).thenReturn("service-1");
        when(bundleServiceRepository.findById("service-1")).thenReturn(Optional.of(bundleService));

        // Mock Cart removal logic
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(new ArrayList<>(List.of(cartItem)));
        when(cartItem.getProductVariant()).thenReturn(variant);
        when(cartItem.getBundleServices()).thenReturn(List.of(bundleService));

        // Stub orderRepository.save to return the order passed to it
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        paymentService.markSuccess(logId, "txn-789");

        verify(orderRepository, times(2)).save(any(Order.class));
        verify(cart).removeItem(cartItem);
        verify(customerRepository).save(customer);
        verify(customerService).recalculateMembership("cust-123");
        verify(paymentLogRepository).save(logRecord);
        assertEquals(PaymentLogStatus.SUCCESS, logRecord.getStatus());
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
