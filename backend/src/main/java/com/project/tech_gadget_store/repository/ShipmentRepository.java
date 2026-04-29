package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Shipment;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ShipmentRepository extends ReactiveCrudRepository<Shipment, UUID> {

    Mono<Shipment> findByOrderId(UUID orderId);

    Mono<Shipment> findByTrackingCode(String trackingCode);
}
