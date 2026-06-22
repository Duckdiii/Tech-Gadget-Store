package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.entity.FavoriteProduct;
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import com.project.tech_gadget_store.repository.FavoriteProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FavoriteProductService {

    private final FavoriteProductRepository favoriteProductRepository;

    public FavoriteProductService(FavoriteProductRepository favoriteProductRepository) {
        this.favoriteProductRepository = favoriteProductRepository;
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
                    f.setUnsubscribedAt(java.time.LocalDateTime.now());
                });
    }
}
