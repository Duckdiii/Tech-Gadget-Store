package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.ProductResponse;
import com.project.tech_gadget_store.entity.Product;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface ProductService {
    Mono<ProductResponse> getProductResponseById(UUID productId);

    Flux<ProductResponse> getAllProductResponses();

    Flux<ProductResponse> getProductResponsesByCategoryId(UUID categoryId);

    Flux<ProductResponse> getProductResponsesByBrandId(UUID brandId);

    Mono<ProductResponse> createProduct(Product product);

    Mono<ProductResponse> updateProduct(UUID productId, Product product);

    Mono<Void> deleteProduct(UUID productId);

}
