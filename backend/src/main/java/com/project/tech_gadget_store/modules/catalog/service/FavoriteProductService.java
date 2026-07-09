package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.dto.response.FavoriteProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FavoriteProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FavoriteResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.FavoriteProduct;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductImage;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.FavoriteProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.dto.response.SubscriptionResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.SubscriptionStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional(readOnly = true)
public class FavoriteProductService {

    private final FavoriteProductRepository favoriteProductRepository;
    private final CustomerRepository customerRepository;
    private final ProductVariantRepository productVariantRepository;

    public FavoriteProductService(FavoriteProductRepository favoriteProductRepository,
            CustomerRepository customerRepository,
            ProductVariantRepository productVariantRepository) {
        this.favoriteProductRepository = favoriteProductRepository;
        this.customerRepository = customerRepository;
        this.productVariantRepository = productVariantRepository;
    }

    public FavoriteProductPageResponseDto getFavoriteProductsPage(String email, int page, int size) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Page<FavoriteProduct> fpPage = favoriteProductRepository.findByCustomerIdAndIsFavoriteTrue(
                customer.getId(), PageRequest.of(page, size));

        List<FavoriteProductResponseDto> items = fpPage.getContent().stream()
                .map(this::toResponseDto)
                .toList();

        return FavoriteProductPageResponseDto.builder()
                .items(items)
                .page(fpPage.getNumber())
                .size(fpPage.getSize())
                .totalItems(fpPage.getTotalElements())
                .totalPages(fpPage.getTotalPages())
                .build();
    }

    public Page<FavoriteProduct> getFavoriteProducts(String customerId, int page, int size) {
        return favoriteProductRepository.findByCustomerIdAndIsFavoriteTrue(
                customerId, PageRequest.of(page, size));
    }

    public boolean isFavorited(String customerId, String productVariantId) {
        return favoriteProductRepository
                .existsByCustomerIdAndProductVariantIdAndIsFavoriteTrue(customerId, productVariantId);
    }

    @Transactional
    public void unsubscribe(String customerId, String productVariantId) {
        favoriteProductRepository.findByCustomerIdAndProductVariantId(customerId, productVariantId)
                .ifPresent(f -> {
                    f.setStatus(SubscriptionStatus.UNSUBSCRIBED);
                    f.setUnsubscribedAt(LocalDateTime.now());
                });
    }

    @Transactional
    public FavoriteResponseDto toggleFavorite(String email, String productVariantId) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        ProductVariant productVariant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        Optional<FavoriteProduct> existing = favoriteProductRepository
                .findByCustomerIdAndProductVariantId(customer.getId(), productVariantId);

        String productName = productVariant.getProduct() != null ? productVariant.getProduct().getName() : productVariantId;

        if (existing.isEmpty()) {
            FavoriteProduct fp = new FavoriteProduct(productVariant, customer, SubscriptionStatus.UNSUBSCRIBED);
            fp.setIsFavorite(true);
            favoriteProductRepository.save(fp);
            return FavoriteResponseDto.builder()
                    .productId(productVariantId)
                    .productName(productName)
                    .isFavorite(true)
                    .message("Added to favorites.")
                    .build();
        }

        FavoriteProduct fp = existing.get();
        if (fp.getIsFavorite() == null || !fp.getIsFavorite()) {
            fp.setIsFavorite(true);
            return FavoriteResponseDto.builder()
                    .productId(productVariantId)
                    .productName(productName)
                    .isFavorite(true)
                    .message("Added to favorites.")
                    .build();
        } else {
            fp.setIsFavorite(false);
            return FavoriteResponseDto.builder()
                    .productId(productVariantId)
                    .productName(productName)
                    .isFavorite(false)
                    .message("Removed from favorites.")
                    .build();
        }
    }

    @Transactional
    public SubscriptionResponseDto toggleSubscription(String email, String productVariantId) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        ProductVariant productVariant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("This product variant is no longer available for subscription."));

        Optional<FavoriteProduct> existing = favoriteProductRepository
                .findByCustomerIdAndProductVariantId(customer.getId(), productVariantId);

        String productName = productVariant.getProduct() != null ? productVariant.getProduct().getName() : productVariantId;

        if (existing.isEmpty()) {
            FavoriteProduct fp = new FavoriteProduct(productVariant, customer, SubscriptionStatus.SUBSCRIBED);
            fp.setIsFavorite(false);
            favoriteProductRepository.save(fp);
            return SubscriptionResponseDto.builder()
                    .productId(productVariantId)
                    .productName(productName)
                    .status(SubscriptionStatus.SUBSCRIBED)
                    .message("You have successfully subscribed to product updates.")
                    .build();
        }

        FavoriteProduct fp = existing.get();
        if (fp.getStatus() == SubscriptionStatus.SUBSCRIBED) {
            fp.setStatus(SubscriptionStatus.UNSUBSCRIBED);
            fp.setUnsubscribedAt(LocalDateTime.now());
            return SubscriptionResponseDto.builder()
                    .productId(productVariantId)
                    .productName(productName)
                    .status(SubscriptionStatus.UNSUBSCRIBED)
                    .message("You have successfully unsubscribed from product updates.")
                    .build();
        } else {
            fp.setStatus(SubscriptionStatus.SUBSCRIBED);
            fp.setUnsubscribedAt(null);
            return SubscriptionResponseDto.builder()
                    .productId(productVariantId)
                    .productName(productName)
                    .status(SubscriptionStatus.SUBSCRIBED)
                    .message("You have successfully subscribed to product updates.")
                    .build();
        }
    }

    private FavoriteProductResponseDto toResponseDto(FavoriteProduct fp) {
        ProductVariant variant = fp.getProductVariant();
        Product product = variant.getProduct();
        List<ProductImage> images = product.getImages();
        String imageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();

        return FavoriteProductResponseDto.builder()
                .id(fp.getId())
                .createdAt(fp.getCreatedAt())
                .updatedAt(fp.getUpdatedAt())
                .productId(product.getId())
                .customerId(fp.getCustomer().getId())
                .status(fp.getStatus())
                .subscribedAt(fp.getSubscribedAt())
                .unsubscribedAt(fp.getUnsubscribedAt())
                .isFavorite(fp.getIsFavorite() != null && fp.getIsFavorite())
                .productName(product.getName())
                .price(variant.getPrice())
                .ramGb(variant.getRamGb())
                .storageGb(variant.getStorageGb())
                .color(variant.getColor())
                .imageUrl(imageUrl)
                .build();
    }
}
