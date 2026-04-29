package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ProductVariant;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ProductVariantRepository extends ReactiveCrudRepository<ProductVariant, UUID> {

    Flux<ProductVariant> findAllByProductId(UUID productId);

    Flux<ProductVariant> findAllByIsActive(Boolean isActive);

    Mono<ProductVariant> findBySkuCode(String skuCode);
}
