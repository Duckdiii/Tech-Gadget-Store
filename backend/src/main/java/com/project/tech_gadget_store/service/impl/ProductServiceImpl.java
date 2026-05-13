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
import java.time.OffsetDateTime;
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
        return productRepository.findAll()
                .filter(existingProduct -> existingProduct.hasNameIgnoreCase(product.getName()))
                .hasElements()
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new ConflictException("Product with name '" + product.getName() + "' already exists"));
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

        if (productVariantRequest.getProductId() == null) {
            return Mono.error(new IllegalArgumentException("Product ID cannot be null"));
        }

        if (!StringUtils.hasText(productVariantRequest.getSkuCode())) {
            return Mono.error(new IllegalArgumentException("SKU code cannot be blank"));
        }

        String normalizedSkuCode = productVariantRequest.getSkuCode().trim();

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

                            ProductVariant productVariant = new ProductVariant();
                            productVariant.setId(UUID.randomUUID());
                            productVariant.setProductId(productVariantRequest.getProductId());
                            productVariant.setSkuCode(normalizedSkuCode);
                            productVariant.setVariantName(productVariantRequest.getName());
                            productVariant.setPrice(BigDecimal.valueOf(productVariantRequest.getPrice()));
                            productVariant.setImageUrl(productVariantRequest.getImage_url());
                            productVariant.setStockQuantity(productVariantRequest.getStockQuantity());
                            productVariant.setLockedQuantity(productVariantRequest.getLockedQuantity());
                            productVariant.setAttributes(productVariantRequest.getAttributes());
                            productVariant.setIsActive(productVariantRequest.getIsActive() != null
                                    ? productVariantRequest.getIsActive()
                                    : Boolean.TRUE);
                            productVariant.setCreatedAt(OffsetDateTime.now());
                            productVariant.setUpdatedAt(OffsetDateTime.now());

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
