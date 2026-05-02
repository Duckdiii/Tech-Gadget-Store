package com.project.tech_gadget_store.service.event;

import com.project.tech_gadget_store.entity.Order;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher { // dùng để publish các sự kiện liên quan đến đơn hàng, như khi đơn hàng được tạo
                                   // hoặc trạng thái đơn hàng thay đổi. Điều này giúp tách biệt logic xử lý sự
                                   // kiện khỏi các phần khác của ứng dụng, làm cho mã dễ bảo trì và mở rộng hơn.
    private final ApplicationEventPublisher applicationEventPublisher; // Spring cung cấp để publish các sự kiện trong
                                                                       // ứng dụng

    public OrderEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void publishOrderCreated(Order order) {
        applicationEventPublisher.publishEvent(new OrderEvent(
                order.getId(),
                order.getAccountId(),
                OrderEventType.ORDER_CREATED,
                order.getOrderStatus(),
                order.getPaymentStatus()));
    }

    public void publishOrderStatusChanged(Order order) {
        applicationEventPublisher.publishEvent(new OrderEvent(
                order.getId(),
                order.getAccountId(),
                OrderEventType.ORDER_STATUS_CHANGED,
                order.getOrderStatus(),
                order.getPaymentStatus()));
    }

}
