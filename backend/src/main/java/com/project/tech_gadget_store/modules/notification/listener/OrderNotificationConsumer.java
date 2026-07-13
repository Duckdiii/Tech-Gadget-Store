package com.project.tech_gadget_store.modules.notification.listener;

import com.project.tech_gadget_store.common.logging.CorrelationIdFilter;
import com.project.tech_gadget_store.config.RabbitMQConfig;
import com.project.tech_gadget_store.modules.notification.dto.response.NotificationResponseDto;
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
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the in-app "order placed" notification (bell icon on {@code StoreNavbar}) off the
 * checkout critical path — see
 * {@link com.project.tech_gadget_store.modules.order.service.CheckoutFacade} — and pushes it
 * live over WebSocket (STOMP, see {@code WebSocketConfig}) to the customer if they're online,
 * so the bell updates without a page refresh.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderNotificationConsumer {

    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.ORDER_NOTIFICATION_QUEUE)
    public void handleOrderPlaced(OrderPlacedMessage message,
            @Header(value = AmqpHeaders.CORRELATION_ID, required = false) String correlationId) {
        try {
            MDC.put(CorrelationIdFilter.MDC_KEY, correlationId);

            Order order = orderRepository.findById(message.orderId())
                    .orElseThrow(() -> new IllegalStateException("Order not found: " + message.orderId()));

            if (order.getCustomer() == null || order.getCustomer().getAccount() == null) {
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

            String email = order.getCustomer().getAccount().getEmail();
            messagingTemplate.convertAndSendToUser(email, "/queue/notifications",
                    NotificationResponseDto.from(notification));
            log.info("Order {} notification pushed over WebSocket to {}", order.getId(), email);
        } finally {
            MDC.remove(CorrelationIdFilter.MDC_KEY);
        }
    }
}
