package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Brand;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface BrandRepository extends ReactiveCrudRepository<Brand, UUID> {

    Mono<Brand> findBySlug(String slug);

    Mono<Boolean> existsBySlug(String slug);
}
