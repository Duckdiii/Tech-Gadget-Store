package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.SubscriptionResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.FavoriteProduct;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.FavoriteProductRepository;
import com.project.tech_gadget_store.repository.ProductRepository;
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
    private final ProductRepository productRepository;

    public FavoriteProductService(FavoriteProductRepository favoriteProductRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository) {
        this.favoriteProductRepository = favoriteProductRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public Page<FavoriteProduct> getFavoriteProducts(String customerId, int page, int size) {
        return favoriteProductRepository.findByCustomerIdAndStatus(
                customerId, SubscriptionStatus.SUBSCRIBED, PageRequest.of(page, size));
    }

    public boolean isFavorited(String customerId, String productId) {
        return favoriteProductRepository
                .existsByCustomerIdAndProductIdAndStatus(customerId, productId, SubscriptionStatus.SUBSCRIBED);
    }

    @Transactional
    public void unsubscribe(String customerId, String productId) {
        favoriteProductRepository.findByCustomerIdAndProductId(customerId, productId)
                .ifPresent(f -> {
                    f.setStatus(SubscriptionStatus.UNSUBSCRIBED);
                    f.setUnsubscribedAt(LocalDateTime.now());
                });
    }

    @Transactional
    public SubscriptionResponseDto toggleSubscription(String email, String productId) {
        Customer customer = customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("This product is no longer available for subscription."));

        Optional<FavoriteProduct> existing = favoriteProductRepository
                .findByCustomerIdAndProductId(customer.getId(), productId);

        if (existing.isEmpty()) {
            new FavoriteProduct(product, customer, SubscriptionStatus.SUBSCRIBED);
            return SubscriptionResponseDto.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .status(SubscriptionStatus.SUBSCRIBED)
                    .message("You have successfully subscribed to product updates.")
                    .build();
        }

        FavoriteProduct fp = existing.get();
        if (fp.getStatus() == SubscriptionStatus.SUBSCRIBED) {
            fp.setStatus(SubscriptionStatus.UNSUBSCRIBED);
            fp.setUnsubscribedAt(LocalDateTime.now());
            return SubscriptionResponseDto.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .status(SubscriptionStatus.UNSUBSCRIBED)
                    .message("You have successfully unsubscribed from product updates.")
                    .build();
        } else {
            fp.setStatus(SubscriptionStatus.SUBSCRIBED);
            fp.setUnsubscribedAt(null);
            return SubscriptionResponseDto.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .status(SubscriptionStatus.SUBSCRIBED)
                    .message("You have successfully subscribed to product updates.")
                    .build();
        }
    }
}
