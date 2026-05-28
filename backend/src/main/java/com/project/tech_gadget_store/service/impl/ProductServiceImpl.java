package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.ProductVariantRequest;
import com.project.tech_gadget_store.dto.response.ProductResponse;
import com.project.tech_gadget_store.dto.response.ProductVariantResponse;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.exception.ConflictException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.ProductRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public Mono<ProductResponse> getProductResponseById(UUID productId) {
        Product.validateProductId(productId);

        return productRepository.findById(productId)
                .filter(Product::isActiveProduct)
                .map(ProductResponse::fromEntity)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Product not found with id: " + productId)));
    }

    @Override
    public Flux<ProductResponse> getAllProductResponses() {
        return productRepository.findAll()
                .filter(Product::isActiveProduct)
                .map(ProductResponse::fromEntity);
    }

    @Override
    public Flux<ProductResponse> getProductResponsesByCategoryId(UUID categoryId) {
        return productRepository.findAllByCategoryId(categoryId)
                .filter(Product::isActiveProduct)
                .map(ProductResponse::fromEntity);
    }

    @Override
    public Flux<ProductResponse> getProductResponsesByBrandId(UUID brandId) {
        return productRepository.findAllByBrandId(brandId)
                .filter(Product::isActiveProduct)
                .map(ProductResponse::fromEntity);
    }

    @Override
    public Mono<ProductResponse> createProduct(Product product) {
        Product.validateForCreate(product);
        String normalizedName = Product.normalizeName(product.getName());

        return productRepository.findAll()
                .filter(existingProduct -> existingProduct.hasNameIgnoreCase(normalizedName))
                .hasElements()
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(
                                new ConflictException("Product with name '" + normalizedName + "' already exists"));
                    }

                    return productRepository.save(Product.createNew(product))
                            .map(ProductResponse::fromEntity);
                });
    }

    @Override
    public Mono<ProductResponse> updateProduct(UUID productId, Product product) {
        return productRepository.findById(productId)
                .flatMap(existingProduct -> {
                    existingProduct.applyUpdate(product);
                    return productRepository.save(existingProduct)
                            .map(ProductResponse::fromEntity);
                })
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Product not found with id: " + productId)));
    }

    @Override
    public Mono<Void> deleteProduct(UUID productId) {
        return productRepository.findById(productId)
                .flatMap(productRepository::delete)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Product not found with id: " + productId)));
    }

    @Override
    public Flux<ProductResponse> searchProductsByName(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Flux.empty();
        }

        return productRepository.findAllByNameContainingIgnoreCase(keyword)
                .filter(Product::isActiveProduct)
                .map(ProductResponse::fromEntity);
    }

    @Override
    public Flux<ProductResponse> getFilteredProducts(UUID categoryId, String attributesFilterJson) {
        return productVariantRepository.findAllByCategoryIdAndAttributesFilter(categoryId, attributesFilterJson)
                .map(ProductVariant::getProductId)
                .distinct()
                .flatMap(productId -> productRepository.findById(productId)
                        .filter(Product::isActiveProduct)
                        .map(ProductResponse::fromEntity));
    }

    @Override
    public Mono<ProductVariantResponse> createProductVariant(ProductVariantRequest productVariantRequest) {
        if (productVariantRequest == null) {
            return Mono.error(new IllegalArgumentException("Product variant request cannot be null"));
        }

        BigDecimal price = BigDecimal.valueOf(productVariantRequest.getPrice());
        ProductVariant.validateForCreate(
                productVariantRequest.getProductId(),
                productVariantRequest.getSkuCode(),
                price,
                productVariantRequest.getStockQuantity(),
                productVariantRequest.getLockedQuantity());
        String normalizedSkuCode = ProductVariant.normalizeSkuCode(productVariantRequest.getSkuCode());

        return productRepository.findById(productVariantRequest.getProductId())
                .filter(Product::isActiveProduct)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException(
                        "Product not found or inactive with id: " + productVariantRequest.getProductId())))
                .flatMap(product -> productVariantRepository.findBySkuCode(normalizedSkuCode)
                        .hasElement()
                        .flatMap(exists -> {
                            if (exists) {
                                return Mono.error(new ConflictException("Product variant with SKU '" + normalizedSkuCode
                                        + "' already exists"));
                            }

                            ProductVariant productVariant = ProductVariant.createNew(
                                    productVariantRequest.getProductId(),
                                    normalizedSkuCode,
                                    productVariantRequest.getName(),
                                    price,
                                    productVariantRequest.getImage_url(),
                                    productVariantRequest.getAttributes(),
                                    productVariantRequest.getStockQuantity(),
                                    productVariantRequest.getLockedQuantity(),
                                    productVariantRequest.getIsActive());

                            return productVariantRepository.save(productVariant)
                                    .map(ProductVariantResponse::fromEntity);
                        }));
    }

    @Override
    public Flux<ProductResponse> search(String keyword) {
        return productRepository.searchProducts(keyword)
                .map(ProductResponse::fromEntity);
    }
}
