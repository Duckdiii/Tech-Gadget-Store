package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Order;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface OrderRepository extends ReactiveCrudRepository<Order, UUID> {

    Flux<Order> findAllByAccountId(UUID accountId);

    Flux<Order> findAllByOrderStatus(String orderStatus);

    Flux<Order> findAllByPaymentStatus(String paymentStatus);

    Mono<Order> findByIdAndAccountIdAndStatus(UUID orderId, UUID accountId, String orderStatus);
}
