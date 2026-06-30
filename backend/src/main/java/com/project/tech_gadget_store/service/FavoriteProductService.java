package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.SubscriptionResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.FavoriteProduct;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.FavoriteProductRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

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

    public Page<FavoriteProduct> getFavoriteProducts(String customerId, int page, int size) {
        return favoriteProductRepository.findByCustomerIdAndStatus(
                customerId, SubscriptionStatus.SUBSCRIBED, PageRequest.of(page, size));
    }

    public boolean isFavorited(String customerId, String productVariantId) {
        return favoriteProductRepository
                .existsByCustomerIdAndProductVariantIdAndStatus(customerId, productVariantId, SubscriptionStatus.SUBSCRIBED);
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
    public SubscriptionResponseDto toggleSubscription(String email, String productVariantId) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        ProductVariant productVariant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("This product variant is no longer available for subscription."));

        Optional<FavoriteProduct> existing = favoriteProductRepository
                .findByCustomerIdAndProductVariantId(customer.getId(), productVariantId);

        String productName = productVariant.getProduct() != null ? productVariant.getProduct().getName() : productVariantId;

        if (existing.isEmpty()) {
            new FavoriteProduct(productVariant, customer, SubscriptionStatus.SUBSCRIBED);
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
}
