package com.project.tech_gadget_store.service;

import tools.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.config.VNPayProperties;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Slf4j
@Service
public class PaymentService {

    private final PaymentLogRepository paymentLogRepository;
    private final MomoPaymentMethodRepository momoMethodRepository;
    private final VNPayPaymentMethodRepository vnpayMethodRepository;
    private final CODPaymentMethodRepository codMethodRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final BundleServiceRepository bundleServiceRepository;
    private final MomoProperties momoProps;
    private final VNPayProperties vnpayProps;
    private final CustomerService customerService;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    public PaymentService(PaymentLogRepository paymentLogRepository,
            MomoPaymentMethodRepository momoMethodRepository,
            VNPayPaymentMethodRepository vnpayMethodRepository,
            CODPaymentMethodRepository codMethodRepository,
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            AddressRepository addressRepository,
            ProductVariantRepository productVariantRepository,
            BundleServiceRepository bundleServiceRepository,
            MomoProperties momoProps,
            VNPayProperties vnpayProps,
            @Lazy CustomerService customerService,
            ObjectMapper objectMapper,
            JdbcTemplate jdbcTemplate) {
        this.paymentLogRepository = paymentLogRepository;
        this.momoMethodRepository = momoMethodRepository;
        this.vnpayMethodRepository = vnpayMethodRepository;
        this.codMethodRepository = codMethodRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.productVariantRepository = productVariantRepository;
        this.bundleServiceRepository = bundleServiceRepository;
        this.momoProps = momoProps;
        this.vnpayProps = vnpayProps;
        this.customerService = customerService;
        this.objectMapper = objectMapper;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    void init() {
        // Drop NOT NULL constraint on order_id in payment_logs table
        try {
            jdbcTemplate.execute("ALTER TABLE payment_logs ALTER COLUMN order_id DROP NOT NULL;");
            log.info("Successfully dropped NOT NULL constraint on payment_logs.order_id");
        } catch (Exception e) {
            log.warn("Could not drop NOT NULL constraint on payment_logs.order_id (it may already be nullable): {}",
                    e.getMessage());
        }

        // Initialize payment methods
        initPaymentMethods();
    }

    void initPaymentMethods() {
        if (momoMethodRepository.findFirstByOrderByCreatedAtAsc().isEmpty()) {
            MomoPaymentMethod momo = new MomoPaymentMethod(
                    "Ví MoMo", "Thanh toán qua ví điện tử MoMo",
                    momoProps.getPartnerCode(),
                    momoProps.getAccessKey(),
                    momoProps.getEndpoint(),
                    momoProps.getRedirectUrl(),
                    momoProps.getIpnUrl());
            momoMethodRepository.save(momo);
        }

        if (vnpayMethodRepository.findFirstByOrderByCreatedAtAsc().isEmpty()) {
            VNPayPaymentMethod vnpay = new VNPayPaymentMethod(
                    "VNPay", "Cổng thanh toán VNPay",
                    vnpayProps.getTmnCode(),
                    vnpayProps.getPaymentUrl(),
                    vnpayProps.getReturnUrl(),
                    vnpayProps.getHashSecret());
            vnpayMethodRepository.save(vnpay);
        }

        if (codMethodRepository.findFirstByOrderByCreatedAtAsc().isEmpty()) {
            CODPaymentMethod cod = new CODPaymentMethod(
                    "COD", "Thanh toán khi nhận hàng (COD)",
                    new BigDecimal("50000000.00"), // 50 million limit
                    BigDecimal.ZERO // free service fee
            );
            codMethodRepository.save(cod);
        }
    }

    @Transactional
    public PaymentLog createPendingLog(String orderId, BigDecimal amount, boolean isMomo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại: " + orderId));

        // Huỷ log PENDING cũ nếu user thử lại
        paymentLogRepository.findFirstByOrderIdAndStatus(orderId, PaymentLogStatus.PENDING)
                .ifPresent(old -> old.markFailed("Thay thế bởi lần thử thanh toán mới"));

        PaymentLog log = new PaymentLog(order, amount, PaymentLogStatus.PENDING);
        return paymentLogRepository.save(log);
    }

    @Transactional
    public PaymentLog createPendingOnlineLog(BigDecimal amount) {
        PaymentLog log = new PaymentLog(null, amount, PaymentLogStatus.PENDING);
        return paymentLogRepository.save(log);
    }

    @Transactional
    public void markSuccess(String logId, String transactionId) {
        // Try looking up by log ID (since logId is passed as the txn ref/orderId)
        PaymentLog logRecord = paymentLogRepository.findById(logId)
                .or(() -> paymentLogRepository.findFirstByOrderIdAndStatus(logId, PaymentLogStatus.PENDING))
                .orElse(null);

        if (logRecord == null) {
            log.warn("PaymentLog not found with ID or OrderID: {}", logId);
            return;
        }

        if (logRecord.getStatus() != PaymentLogStatus.PENDING) {
            return; // Already processed
        }

        logRecord.markSuccess();
        paymentLogRepository.save(logRecord);

        if (logRecord.getOrder() != null) {
            Order order = logRecord.getOrder();
            if (!order.isPaid()) {
                order.markPaid();
                orderRepository.save(order);
            }
            customerService.recalculateMembership(order.getCustomer().getId());
        }
    }

    @Transactional
    public void markFailed(String logId, String reason) {
        PaymentLog logRecord = paymentLogRepository.findById(logId)
                .or(() -> paymentLogRepository.findFirstByOrderIdAndStatus(logId, PaymentLogStatus.PENDING))
                .orElse(null);

        if (logRecord == null) {
            log.warn("PaymentLog not found with ID or OrderID: {}", logId);
            return;
        }

        if (logRecord.getStatus() != PaymentLogStatus.PENDING) {
            return; // Already processed
        }

        if (reason != null && (reason.contains("resultCode=49") || reason.contains("responseCode=24")
                || reason.toLowerCase().contains("cancel"))) {
            logRecord.setStatus(PaymentLogStatus.CANCELLED);
            logRecord.setFailureReason(reason);
        } else {
            logRecord.markFailed(reason);
        }
        paymentLogRepository.save(logRecord);
    }

}
