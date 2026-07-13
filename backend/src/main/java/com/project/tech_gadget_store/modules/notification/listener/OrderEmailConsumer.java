package com.project.tech_gadget_store.modules.notification.listener;

import com.project.tech_gadget_store.common.logging.CorrelationIdFilter;
import com.project.tech_gadget_store.config.RabbitMQConfig;
import com.project.tech_gadget_store.modules.notification.service.EmailService;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.event.OrderPlacedMessage;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

/**
 * Sends the order-confirmation email off the checkout critical path — see
 * {@link com.project.tech_gadget_store.modules.order.service.CheckoutFacade}, which publishes
 * {@link OrderPlacedMessage} and returns immediately without waiting for this to run.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEmailConsumer {

    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_EMAIL_QUEUE)
    public void handleOrderPlaced(OrderPlacedMessage message,
            @Header(value = AmqpHeaders.CORRELATION_ID, required = false) String correlationId) {
        try {
            MDC.put(CorrelationIdFilter.MDC_KEY, correlationId);

            Order order = orderRepository.findById(message.orderId())
                    .orElseThrow(() -> new IllegalStateException("Order not found: " + message.orderId()));

            if (order.getCustomer() == null || order.getCustomer().getAccount() == null) {
                log.warn("Order {} has no customer account to email", order.getId());
                return;
            }

            String email = order.getCustomer().getAccount().getEmail();
            String subject = "[TechStore] Đặt hàng thành công - #" + order.getId();
            String body = "Cảm ơn bạn đã đặt hàng tại TechStore!\n\n"
                    + "Mã đơn hàng: " + order.getId() + "\n"
                    + "Chúng tôi sẽ sớm xử lý và giao hàng cho bạn.";

            emailService.send(email, subject, body);
            log.info("Order {} confirmation email sent to {}", order.getId(), email);
        } finally {
            MDC.remove(CorrelationIdFilter.MDC_KEY);
        }
    }
}
