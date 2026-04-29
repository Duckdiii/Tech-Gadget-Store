package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.OrderItem;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface OrderItemRepository extends ReactiveCrudRepository<OrderItem, UUID> {

    Flux<OrderItem> findAllByOrderId(UUID orderId);

    Flux<OrderItem> findAllByVariantId(UUID variantId);
}
