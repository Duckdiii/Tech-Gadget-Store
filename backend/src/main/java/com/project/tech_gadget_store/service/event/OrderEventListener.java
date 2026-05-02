package com.project.tech_gadget_store.service.event;

import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.service.notification.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class OrderEventListener {
    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class); // Logger để ghi lại thông tin
                                                                                         // về việc gửi email, bao gồm
                                                                                         // cả lỗi nếu có xảy ra. Điều
                                                                                         // này giúp theo dõi hoạt động
                                                                                         // của hệ thống và dễ dàng phát
                                                                                         // hiện vấn đề.

    private final EmailService emailService;
    private final AccountRepository accountRepository;

    public OrderEventListener(EmailService emailService, AccountRepository accountRepository) {
        this.emailService = emailService;
        this.accountRepository = accountRepository;
    }

    @Async
    @EventListener
    public void onOrderEvent(OrderEvent event) { // Phương thức này sẽ được gọi khi có một OrderEvent được publish. Nó
                                                 // sẽ lấy thông tin tài khoản liên quan đến đơn hàng và gửi email thông
                                                 // báo cho khách hàng về sự kiện đơn hàng.
        accountRepository.findById(event.accountId())
                // doOnNext khi tìm được account, gọi hàm gửi mail.
                .doOnNext(account -> dispatchEmail(event, account))
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("Skip email: account not found for orderId={}, accountId={}",
                            event.orderId(), event.accountId());
                    return Mono.empty();
                }))
                .doOnError(ex -> log.error("Order event email failed: orderId={}, eventType={}",
                        event.orderId(), event.eventType(), ex))
                .subscribe(); // subscribe để kích hoạt chuỗi reactive. Nếu không gọi subscribe, các thao tác
                              // trên Mono sẽ không được thực thi.
    }

    private void dispatchEmail(OrderEvent event, Account account) {
        String to = account.getEmail();
        if (to == null || to.isBlank()) {
            log.warn("Skip email: empty recipient for accountId={}", account.getId());
            return;
        }

        String orderRef = event.orderId() == null ? "N/A" : event.orderId().toString();
        String subject = "TechStore - Cap nhat don hang " + orderRef;

        if (event.eventType() == OrderEventType.ORDER_CREATED) {
            emailService.sendOrderCreatedEmail(to, "TechStore - Xac nhan tao don hang",
                    "Don hang cua ban da duoc tao thanh cong. Ma don: " + orderRef);
            return;
        }

        if (event.eventType() == OrderEventType.PAYMENT_RESULT_UPDATED) {
            emailService.sendPaymentResultEmail(to, "TechStore - Ket qua thanh toan",
                    "Trang thai thanh toan don " + orderRef + ": " + event.paymentStatus());
            return;
        }

        String status = event.orderStatus() == null ? "" : event.orderStatus().trim().toUpperCase();
        String body = "Don hang " + orderRef + " da duoc cap nhat trang thai: " + status;

        if (OrderStatus.CANCELLED.name().equals(status)) {
            emailService.sendOrderCancelledEmail(to, subject, body);
            return;
        }

        if (OrderStatus.SHIPPING.name().equals(status)) {
            emailService.sendOrderShippingEmail(to, subject, body);
            return;
        }

        if (OrderStatus.COMPLETED.name().equals(status)) {
            emailService.sendOrderDeliveredEmail(to, subject, body);
            return;
        }

        emailService.sendOrderUpdatedEmail(to, subject, body);
    }
}
