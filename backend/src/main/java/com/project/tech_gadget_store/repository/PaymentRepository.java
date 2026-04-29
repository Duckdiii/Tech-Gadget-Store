package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Payment;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface PaymentRepository extends ReactiveCrudRepository<Payment, UUID> {

    Flux<Payment> findAllByOrderId(UUID orderId);

    Mono<Payment> findByTransactionId(String transactionId);
}
