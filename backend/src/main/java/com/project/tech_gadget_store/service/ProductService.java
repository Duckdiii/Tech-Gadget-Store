package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.ProductResponse;
import com.project.tech_gadget_store.dto.request.ProductRequest;
import com.project.tech_gadget_store.dto.request.ProductVariantRequest;
import com.project.tech_gadget_store.dto.response.ProductVariantResponse;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.ProductVariant;

import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface ProductService {
    // Common methods
    Mono<ProductResponse> getProductResponseById(UUID productId);

    Flux<ProductResponse> getAllProductResponses();

    Flux<ProductResponse> getProductResponsesByBrandId(UUID brandId);

    Flux<ProductResponse> searchProductsByName(String keyword);

    Mono<ProductResponse> createProduct(Product product);

    Mono<ProductResponse> updateProduct(UUID productId, Product product);

    Mono<Void> deleteProduct(UUID productId);

    Mono<ProductVariantResponse> createProductVariant(ProductVariantRequest productVariantRequest);

    // Filter
    Flux<ProductResponse> getProductResponsesByCategoryId(UUID categoryId);

    Flux<ProductResponse> getFilteredProducts(UUID categoryId, String attributesFilterJson);
}
