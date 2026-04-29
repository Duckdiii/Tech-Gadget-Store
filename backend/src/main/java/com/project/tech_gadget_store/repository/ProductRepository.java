package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Product;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface ProductRepository extends ReactiveCrudRepository<Product, UUID> {

    Flux<Product> findAllByCategoryId(UUID categoryId);

    Flux<Product> findAllByBrandId(UUID brandId);

    Flux<Product> findAllByIsActive(Boolean isActive);

    Flux<Product> findAllByNameContainingIgnoreCase(String keyword);
}
