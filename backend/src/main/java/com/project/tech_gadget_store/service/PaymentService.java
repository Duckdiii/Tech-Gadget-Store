package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.config.VNPayProperties;
import com.project.tech_gadget_store.entity.MomoPaymentMethod;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.PaymentLog;
import com.project.tech_gadget_store.entity.PaymentMethod;
import com.project.tech_gadget_store.entity.VNPayPaymentMethod;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.repository.MomoPaymentMethodRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.repository.PaymentLogRepository;
import com.project.tech_gadget_store.repository.VNPayPaymentMethodRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class PaymentService {

    private final PaymentLogRepository paymentLogRepository;
    private final MomoPaymentMethodRepository momoMethodRepository;
    private final VNPayPaymentMethodRepository vnpayMethodRepository;
    private final OrderRepository orderRepository;
    private final MomoProperties momoProps;
    private final VNPayProperties vnpayProps;

    public PaymentService(PaymentLogRepository paymentLogRepository,
                          MomoPaymentMethodRepository momoMethodRepository,
                          VNPayPaymentMethodRepository vnpayMethodRepository,
                          OrderRepository orderRepository,
                          MomoProperties momoProps,
                          VNPayProperties vnpayProps) {
        this.paymentLogRepository = paymentLogRepository;
        this.momoMethodRepository = momoMethodRepository;
        this.vnpayMethodRepository = vnpayMethodRepository;
        this.orderRepository = orderRepository;
        this.momoProps = momoProps;
        this.vnpayProps = vnpayProps;
    }

    // Đảm bảo DB luôn có bản ghi PaymentMethod cho MoMo và VNPay dựa trên config yml
    @PostConstruct
    void initPaymentMethods() {
        if (momoMethodRepository.findFirstByOrderByCreatedAtAsc().isEmpty()) {
            MomoPaymentMethod momo = new MomoPaymentMethod(
                    "Ví MoMo", "Thanh toán qua ví điện tử MoMo",
                    momoProps.getPartnerCode(),
                    momoProps.getAccessKey(),   // merchantId = accessKey
                    momoProps.getEndpoint(),
                    momoProps.getRedirectUrl(),
                    momoProps.getIpnUrl()
            );
            momoMethodRepository.save(momo);
        }

        if (vnpayMethodRepository.findFirstByOrderByCreatedAtAsc().isEmpty()) {
            VNPayPaymentMethod vnpay = new VNPayPaymentMethod(
                    "VNPay", "Cổng thanh toán VNPay",
                    vnpayProps.getTmnCode(),
                    vnpayProps.getPaymentUrl(),
                    vnpayProps.getReturnUrl(),
                    vnpayProps.getHashSecret()
            );
            vnpayMethodRepository.save(vnpay);
        }
    }

    @Transactional
    public PaymentLog createPendingLog(String orderId, BigDecimal amount, boolean isMomo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại: " + orderId));

        PaymentMethod method = isMomo
                ? momoMethodRepository.findFirstByOrderByCreatedAtAsc()
                        .orElseThrow(() -> new IllegalStateException("Chưa có cấu hình MoMo trong DB"))
                : vnpayMethodRepository.findFirstByOrderByCreatedAtAsc()
                        .orElseThrow(() -> new IllegalStateException("Chưa có cấu hình VNPay trong DB"));

        // Huỷ log PENDING cũ nếu user thử lại
        paymentLogRepository.findFirstByOrderIdAndStatus(orderId, PaymentLogStatus.PENDING)
                .ifPresent(old -> old.markFailed("Thay thế bởi lần thử thanh toán mới"));

        PaymentLog log = new PaymentLog(order, amount, method, PaymentLogStatus.PENDING);
        return paymentLogRepository.save(log);
    }

    @Transactional
    public void markSuccess(String orderId, String transactionId) {
        paymentLogRepository.findFirstByOrderIdAndStatus(orderId, PaymentLogStatus.PENDING)
                .ifPresent(log -> {
                    log.setTransactionId(transactionId);
                    log.markSuccess();
                });

        // Cập nhật trạng thái Order — chỉ cập nhật nếu chưa được paid
        orderRepository.findById(orderId).ifPresent(order -> {
            if (!order.isPaid()) {
                order.markPaid();
            }
        });
    }

    @Transactional
    public void markFailed(String orderId, String reason) {
        paymentLogRepository.findFirstByOrderIdAndStatus(orderId, PaymentLogStatus.PENDING)
                .ifPresent(log -> log.markFailed(reason));
    }
}
