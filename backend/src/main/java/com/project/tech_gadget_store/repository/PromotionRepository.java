package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Promotion;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.UUID;

@Repository
public interface PromotionRepository extends ReactiveCrudRepository<Promotion, UUID> {

    Mono<Promotion> save(Promotion promotion);

    Mono<Promotion> findById(UUID id);

    Flux<Promotion> findAll();

    Mono<Void> deleteById(UUID id);

    Flux<Promotion> findAllByIsActive(Boolean isActive);

    Flux<Promotion> findAllByStartDateLessThanEqualAndEndDateGreaterThanEqualAndIsActiveTrue(
            OffsetDateTime currentStart,
            OffsetDateTime currentEnd);

    Mono<Boolean> existsByNameIgnoreCase(String name);
}
