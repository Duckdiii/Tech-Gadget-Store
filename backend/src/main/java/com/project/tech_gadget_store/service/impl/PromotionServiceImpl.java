package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.PromotionRequest;
import com.project.tech_gadget_store.dto.response.PromotionResponse;
import com.project.tech_gadget_store.entity.Promotion;
import com.project.tech_gadget_store.exception.ConflictException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.PromotionRepository;
import com.project.tech_gadget_store.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    @Override
    public Mono<PromotionResponse> getPromotionById(UUID promotionId) {
        Promotion.validatePromotionId(promotionId);

        return promotionRepository.findById(promotionId)
                .map(PromotionResponse::fromEntity)
                .switchIfEmpty(
                        Mono.error(new ResourceNotFoundException("Promotion not found with id: " + promotionId)));
    }

    @Override
    public Flux<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll()
                .map(PromotionResponse::fromEntity);
    }

    @Override
    public Flux<PromotionResponse> getActivePromotions() {
        return promotionRepository.findAllByIsActive(true)
                .map(PromotionResponse::fromEntity);
    }

    @Override
    public Flux<PromotionResponse> getCurrentActivePromotions() {
        OffsetDateTime now = OffsetDateTime.now();
        return promotionRepository.findAllByStartDateLessThanEqualAndEndDateGreaterThanEqualAndIsActiveTrue(now, now)
                .map(PromotionResponse::fromEntity);
    }

    @Override
    public Mono<PromotionResponse> createPromotion(PromotionRequest request) {
        if (request == null) {
            return Mono.error(new IllegalArgumentException("Promotion request cannot be null"));
        }

        String normalizedName = Promotion.normalizeName(request.getName());

        return promotionRepository.existsByNameIgnoreCase(normalizedName)
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(
                                new ConflictException("Promotion with name '" + normalizedName + "' already exists"));
                    }

                    Promotion promotion = Promotion.createNew(
                            request.getName(),
                            request.getDescription(),
                            request.getDiscountType(),
                            request.getDiscountValue(),
                            request.getStartDate(),
                            request.getEndDate(),
                            request.getIsActive());

                    return promotionRepository.save(promotion)
                            .map(PromotionResponse::fromEntity);
                });
    }

    @Override
    public Mono<PromotionResponse> updatePromotion(UUID promotionId, PromotionRequest request) {
        Promotion.validatePromotionId(promotionId);

        if (request == null) {
            return Mono.error(new IllegalArgumentException("Promotion request cannot be null"));
        }

        String normalizedName = Promotion.normalizeName(request.getName());

        return promotionRepository.findById(promotionId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Promotion not found with id: " + promotionId)))
                .flatMap(existingPromotion -> promotionRepository.existsByNameIgnoreCase(normalizedName)
                        .flatMap(exists -> {
                            if (exists && !existingPromotion.hasSameNameIgnoreCase(normalizedName)) {
                                return Mono.error(
                                        new ConflictException("Promotion with name '" + normalizedName
                                                + "' already exists"));
                            }

                            existingPromotion.applyUpdate(
                                    request.getName(),
                                    request.getDescription(),
                                    request.getDiscountType(),
                                    request.getDiscountValue(),
                                    request.getStartDate(),
                                    request.getEndDate(),
                                    request.getIsActive());

                            return promotionRepository.save(existingPromotion)
                                    .map(PromotionResponse::fromEntity);
                        }));
    }

    @Override
    public Mono<Void> deletePromotion(UUID promotionId) {
        Promotion.validatePromotionId(promotionId);

        return promotionRepository.findById(promotionId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Promotion not found with id: " + promotionId)))
                .flatMap(promotion -> promotionRepository.deleteById(promotion.getId()));
    }
}
