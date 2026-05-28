package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.repository.OrderItemRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.service.OrderService;
import com.project.tech_gadget_store.service.event.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository variantRepository;

    private final OrderEventPublisher orderEventPublisher;

    @Override
    public Mono<Order> getOrderById(UUID orderId, UUID accountId) {
        return orderRepository.findByIdAndAccountId(orderId, accountId);
    }

    @Override
    public Flux<Order> getOrdersByAccountId(UUID accountId) {
        return orderRepository.findAllByAccountId(accountId);
    }

    @Override
    public Mono<Order> updateStatusOrder(UUID orderId, UUID accountId, String orderStatus) {
        return orderRepository.findByIdAndAccountId(orderId, accountId)
                .flatMap(order -> {
                    order.changeStatus(orderStatus);
                    return orderRepository.save(order);
                })
                .doOnNext(orderEventPublisher::publishOrderStatusChanged);
    }

    @Override
    public Mono<Void> cancelPendingOrder(UUID orderId, UUID accountId) {
        return orderRepository.findByIdAndAccountIdAndOrderStatus(orderId, accountId, OrderStatus.PENDING.name())
                .flatMap(order -> {
                    order.cancelPendingOrder();
                    return orderItemRepository.findAllByOrderId(order.getId())
                            .flatMap(orderItem -> variantRepository
                                    .setStockQuantity(orderItem.getVariantId(), orderItem.getQuantity())
                                    .then())
                            .then(orderRepository.save(order));
                })
                .doOnNext(orderEventPublisher::publishOrderStatusChanged)
                .then();
    }
}
