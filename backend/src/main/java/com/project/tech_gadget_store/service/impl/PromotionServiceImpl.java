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
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {
    private static final Set<String> SUPPORTED_DISCOUNT_TYPES = Set.of("PERCENT", "FIXED_AMOUNT");

    private final PromotionRepository promotionRepository;

    @Override
    public Mono<PromotionResponse> getPromotionById(UUID promotionId) {
        if (promotionId == null) {
            return Mono.error(new IllegalArgumentException("Promotion ID cannot be null"));
        }

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

        if (request.getStartDate() != null && request.getEndDate() != null
                && !request.getEndDate().isAfter(request.getStartDate())) {
            return Mono.error(new IllegalArgumentException("End date must be after start date"));
        }

        String normalizedName = normalizeName(request.getName());
        String normalizedDiscountType = normalizeDiscountType(request.getDiscountType());

        if (!SUPPORTED_DISCOUNT_TYPES.contains(normalizedDiscountType)) {
            return Mono.error(new IllegalArgumentException("Unsupported discount type: " + request.getDiscountType()));
        }

        OffsetDateTime now = OffsetDateTime.now();

        return promotionRepository.existsByNameIgnoreCase(normalizedName)
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(
                                new ConflictException("Promotion with name '" + normalizedName + "' already exists"));
                    }

                    Promotion promotion = Promotion.builder()
                            .id(UUID.randomUUID())
                            .name(normalizedName)
                            .description(request.getDescription())
                            .discountType(normalizedDiscountType)
                            .discountValue(request.getDiscountValue())
                            .startDate(request.getStartDate())
                            .endDate(request.getEndDate())
                            .isActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE)
                            .createdAt(now)
                            .updatedAt(now)
                            .build();

                    return promotionRepository.save(promotion)
                            .map(PromotionResponse::fromEntity);
                });
    }

    @Override
    public Mono<PromotionResponse> updatePromotion(UUID promotionId, PromotionRequest request) {
        if (promotionId == null) {
            return Mono.error(new IllegalArgumentException("Promotion ID cannot be null"));
        }

        if (request == null) {
            return Mono.error(new IllegalArgumentException("Promotion request cannot be null"));
        }

        if (request.getStartDate() != null && request.getEndDate() != null
                && !request.getEndDate().isAfter(request.getStartDate())) {
            return Mono.error(new IllegalArgumentException("End date must be after start date"));
        }

        String normalizedDiscountType = normalizeDiscountType(request.getDiscountType());
        if (!SUPPORTED_DISCOUNT_TYPES.contains(normalizedDiscountType)) {
            return Mono.error(new IllegalArgumentException("Unsupported discount type: " + request.getDiscountType()));
        }

        String normalizedName = normalizeName(request.getName());

        return promotionRepository.findById(promotionId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Promotion not found with id: " + promotionId)))
                .flatMap(existingPromotion -> promotionRepository.existsByNameIgnoreCase(normalizedName)
                        .flatMap(exists -> {
                            if (exists && !existingPromotion.getName().equalsIgnoreCase(normalizedName)) {
                                return Mono.error(
                                        new ConflictException("Promotion with name '" + normalizedName
                                                + "' already exists"));
                            }

                            existingPromotion.setName(normalizedName);
                            existingPromotion.setDescription(request.getDescription());
                            existingPromotion.setDiscountType(normalizedDiscountType);
                            existingPromotion.setDiscountValue(request.getDiscountValue());
                            existingPromotion.setStartDate(request.getStartDate());
                            existingPromotion.setEndDate(request.getEndDate());
                            existingPromotion.setIsActive(
                                    request.getIsActive() != null ? request.getIsActive()
                                            : existingPromotion.getIsActive());
                            existingPromotion.setUpdatedAt(OffsetDateTime.now());

                            return promotionRepository.save(existingPromotion)
                                    .map(PromotionResponse::fromEntity);
                        }));
    }

    @Override
    public Mono<Void> deletePromotion(UUID promotionId) {
        if (promotionId == null) {
            return Mono.error(new IllegalArgumentException("Promotion ID cannot be null"));
        }

        return promotionRepository.findById(promotionId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Promotion not found with id: " + promotionId)))
                .flatMap(promotion -> promotionRepository.deleteById(promotion.getId()));
    }

    private String normalizeName(String name) {
        return StringUtils.hasText(name) ? name.trim() : name;
    }

    private String normalizeDiscountType(String discountType) {
        return StringUtils.hasText(discountType) ? discountType.trim().toUpperCase(Locale.ROOT) : discountType;
    }
}
