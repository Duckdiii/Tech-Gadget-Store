package com.project.tech_gadget_store.modules.notification.listener;

import com.project.tech_gadget_store.common.logging.CorrelationIdFilter;
import com.project.tech_gadget_store.config.RabbitMQConfig;
import com.project.tech_gadget_store.modules.notification.entity.Notification;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationType;
import com.project.tech_gadget_store.modules.notification.repository.NotificationRepository;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.event.OrderPlacedMessage;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

/**
 * Creates the in-app "order placed" notification (bell icon on {@code StoreNavbar}) off the
 * checkout critical path — see
 * {@link com.project.tech_gadget_store.modules.order.service.CheckoutFacade}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderNotificationConsumer {

    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = RabbitMQConfig.ORDER_NOTIFICATION_QUEUE)
    public void handleOrderPlaced(OrderPlacedMessage message,
            @Header(value = AmqpHeaders.CORRELATION_ID, required = false) String correlationId) {
        try {
            MDC.put(CorrelationIdFilter.MDC_KEY, correlationId);

            Order order = orderRepository.findById(message.orderId())
                    .orElseThrow(() -> new IllegalStateException("Order not found: " + message.orderId()));

            if (order.getCustomer() == null) {
                throw new IllegalStateException("Order " + order.getId() + " has no customer for notification");
            }

            Notification notification = new Notification(
                    order.getCustomer(),
                    "Đặt hàng thành công",
                    NotificationType.ORDER_PLACED,
                    "Đơn hàng #" + order.getId() + " của bạn đã được tiếp nhận và đang được xử lý.",
                    List.of(NotificationChannel.WEB));
            notification.markSent();
            notificationRepository.save(notification);
            log.info("Order {} notification created", order.getId());
        } finally {
            MDC.remove(CorrelationIdFilter.MDC_KEY);
        }
    }
}
