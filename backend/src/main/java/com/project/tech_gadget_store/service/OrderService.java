package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.entity.Order;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface OrderService {
    Mono<Order> getOrderById(UUID orderId, UUID accountId);

    Flux<Order> getOrdersByAccountId(UUID accountId);

    Mono<Order> updateStatusOrder(UUID orderId, UUID accountId, String orderStatus);

    Mono<Void> cancelPendingOrder(UUID orderId, UUID accountId);

}