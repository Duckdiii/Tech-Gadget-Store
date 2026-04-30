package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.ProductVariantRequest;
import com.project.tech_gadget_store.dto.response.ProductResponse;
import com.project.tech_gadget_store.dto.response.ProductVariantResponse;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import com.project.tech_gadget_store.repository.ProductRepository;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import com.project.tech_gadget_store.exception.ConflictException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
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
        // Kiểm tra nếu sản phẩm tồn tại và đang hoạt động, nếu không thì trả về lỗi
        // NotFoundException
        if (productId == null) {
            return Mono.error(new IllegalArgumentException("Product ID cannot be null"));
        } else {
            return productRepository.findById(productId)
                    .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                    .map(ProductResponse::fromEntity)
                    .switchIfEmpty(
                            Mono.error(new ResourceNotFoundException("Product not found with id: " + productId)));
        }

    }

    @Override
    public Flux<ProductResponse> getAllProductResponses() {
        return productRepository.findAll()
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .map(ProductResponse::fromEntity);
    }

    @Override
    public Flux<ProductResponse> getProductResponsesByCategoryId(UUID categoryId) {
        return productRepository.findAllByCategoryId(categoryId)
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .map(ProductResponse::fromEntity);
    }

    @Override
    public Flux<ProductResponse> getProductResponsesByBrandId(UUID brandId) {
        return productRepository.findAllByBrandId(brandId)
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .map(ProductResponse::fromEntity);
    }

    @Override
    public Mono<ProductResponse> createProduct(Product product) {
        // Kiểm tra nếu đã tồn tại sản phẩm với tên giống nhau (không phân biệt chữ hoa
        // chữ thường)
        return productRepository.findAll()
                .filter(existingProduct -> existingProduct.getName().equalsIgnoreCase(product.getName()))
                .hasElements()
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(
                                new ConflictException("Product with name '" + product.getName() + "' already exists"));
                    } else {
                        // Nếu không tồn tại, tiến hành lưu sản phẩm mới
                        product.setId(UUID.randomUUID());
                        product.setCreatedAt(OffsetDateTime.now());
                        product.setUpdatedAt(OffsetDateTime.now());
                        return productRepository.save(product)
                                .map(ProductResponse::fromEntity);
                    }
                });
    }

    @Override
    public Mono<ProductResponse> updateProduct(UUID productId, Product product) {
        return productRepository.findById(productId)
                .flatMap(existingProduct -> {
                    existingProduct.setName(product.getName());
                    existingProduct.setCategoryId(product.getCategoryId());
                    existingProduct.setBrandId(product.getBrandId());
                    existingProduct.setDescription(product.getDescription());
                    existingProduct.setIsActive(product.getIsActive());
                    existingProduct.setUpdatedAt(OffsetDateTime.now());
                    return productRepository.save(existingProduct)
                            .map(ProductResponse::fromEntity);
                })
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Product not found with id: " + productId)));

    }

    @Override
    public Mono<Void> deleteProduct(UUID productId) {
        return productRepository.findById(productId)
                .flatMap(product -> productRepository.delete(product))
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Product not found with id: " + productId)));

    }

    @Override
    public Flux<ProductResponse> searchProductsByName(String keyword) {
        if (StringUtils.hasText(keyword)) {
            return productRepository.findAllByNameContainingIgnoreCase(keyword)
                    .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                    .map(ProductResponse::fromEntity);
        } else {
            return Flux.empty();
        }
    }

    @Override
    public Flux<ProductResponse> getFilteredProducts(UUID categoryId, String attributesFilterJson) {
        // Lấy tất cả variant thỏa mãn categoryId và filter, sau đó map về productId và
        // lấy distinct productId
        // Cuối cùng lấy product theo productId và map về ProductResponse
        return productVariantRepository.findAllByCategoryIdAndAttributesFilter(categoryId, attributesFilterJson)
                .map(ProductVariant::getProductId)
                .distinct()
                .flatMap(productId -> productRepository.findById(productId)
                        .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
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
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .switchIfEmpty(Mono.error(new ResourceNotFoundException(
                        "Product not found or inactive with id: " + productVariantRequest.getProductId())))
                .flatMap(product -> productVariantRepository.findBySkuCode(normalizedSkuCode)
                        .hasElement()
                        .flatMap(exists -> {
                            if (exists) {
                                return Mono.error(
                                        new ConflictException("Product variant with SKU '" + normalizedSkuCode
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
                .map(ProductResponse::fromEntity); // Dùng lại hàm map xịn xò của bạn
    }

}
