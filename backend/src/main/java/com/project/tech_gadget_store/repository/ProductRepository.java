package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Product;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ProductRepository extends ReactiveCrudRepository<Product, UUID> {

    Mono<Product> save(Product product);

    Flux<Product> findAll();

    Mono<Product> findById(UUID id);

    Flux<Product> findAllByCategoryId(UUID categoryId);

    Flux<Product> findAllByBrandId(UUID brandId);

    Flux<Product> findAllByIsActive(Boolean isActive);

    Flux<Product> findAllByNameContainingIgnoreCase(String keyword);

    // Search product using full text search
    @Query("SELECT * FROM products WHERE search_vector @@ websearch_to_tsquery('english', :query)")
    Flux<Product> searchProducts(String query);
}
