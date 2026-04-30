package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Category;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface CategoryRepository extends ReactiveCrudRepository<Category, UUID> {

    Mono<Category> findBySlug(String slug);

    Flux<Category> findAllByParentId(UUID parentId);

    Mono<Boolean> existsBySlug(String slug);

    Mono<Boolean> existsByNameIgnoreCase(String name);

    Mono<Boolean> existsByParentId(UUID parentId);
}
