package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.response.ProductResponse;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import com.project.tech_gadget_store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import com.project.tech_gadget_store.exception.ConflictException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;

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

    public Flux<ProductResponse> getAllProductResponses() {
        return productRepository.findAll()
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .map(ProductResponse::fromEntity);
    }

    public Flux<ProductResponse> getProductResponsesByCategoryId(UUID categoryId) {
        return productRepository.findAllByCategoryId(categoryId)
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .map(ProductResponse::fromEntity);
    }

    public Flux<ProductResponse> getProductResponsesByBrandId(UUID brandId) {
        return productRepository.findAllByBrandId(brandId)
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .map(ProductResponse::fromEntity);
    }

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

    public Mono<Void> deleteProduct(UUID productId) {
        return productRepository.findById(productId)
                .flatMap(product -> productRepository.delete(product))
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Product not found with id: " + productId)));

    }

}
