package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ProductEmbedding;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ProductEmbeddingRepository extends ReactiveCrudRepository<ProductEmbedding, UUID> {

    Mono<ProductEmbedding> findByProductId(UUID productId);

    Flux<ProductEmbedding> findAllByContentContainingIgnoreCase(String keyword);
}
