package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Review;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface ReviewRepository extends ReactiveCrudRepository<Review, UUID> {

    Flux<Review> findAllByProductId(UUID productId);

    Flux<Review> findAllByCustomerId(UUID customerId);
}
