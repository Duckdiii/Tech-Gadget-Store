package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PromotionRequest;
import com.project.tech_gadget_store.dto.response.PromotionResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface PromotionService {
    Mono<PromotionResponse> getPromotionById(UUID promotionId);

    Flux<PromotionResponse> getAllPromotions();

    Flux<PromotionResponse> getActivePromotions();

    Flux<PromotionResponse> getCurrentActivePromotions();

    Mono<PromotionResponse> createPromotion(PromotionRequest request);

    Mono<PromotionResponse> updatePromotion(UUID promotionId, PromotionRequest request);

    Mono<Void> deletePromotion(UUID promotionId);
}
