package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PromotionRequestDto;
import com.project.tech_gadget_store.dto.response.PromotionPerformanceResponseDto;
import com.project.tech_gadget_store.dto.response.PromotionResponseDto;
import com.project.tech_gadget_store.dto.response.PromotionSummaryResponseDto;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.Promotion;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.PromotionMapper;
import com.project.tech_gadget_store.repository.ProductRepository;
import com.project.tech_gadget_store.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final PromotionMapper promotionMapper;

    public PromotionService(PromotionRepository promotionRepository,
                            ProductRepository productRepository,
                            PromotionMapper promotionMapper) {
        this.promotionRepository = promotionRepository;
        this.productRepository = productRepository;
        this.promotionMapper = promotionMapper;
    }

    public List<PromotionResponseDto> getAllPromotions() {
        return promotionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(promotionMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public PromotionResponseDto createPromotion(PromotionRequestDto dto) {
        if (promotionRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Promotion code already exists: " + dto.getCode());
        }
        if (!dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new IllegalArgumentException("endAt must be after startAt");
        }
        List<Product> products = productRepository.findAllById(dto.getProductIds());
        if (products.size() != dto.getProductIds().size()) {
            throw new ResourceNotFoundException("One or more products not found");
        }
        Promotion promotion = new Promotion(
                dto.getCode(), dto.getName(), dto.getDiscountPercent(),
                dto.getStartAt(), dto.getEndAt(), dto.getActive(), null);
        products.forEach(promotion::addProduct);
        return promotionMapper.toResponseDto(promotionRepository.save(promotion));
    }

    @Transactional
    public PromotionResponseDto updatePromotion(String id, PromotionRequestDto dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
        if (promotionRepository.existsByCodeAndIdNot(dto.getCode(), id)) {
            throw new DuplicateResourceException("Promotion code already exists: " + dto.getCode());
        }
        if (!dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new IllegalArgumentException("endAt must be after startAt");
        }
        List<Product> products = productRepository.findAllById(dto.getProductIds());
        if (products.size() != dto.getProductIds().size()) {
            throw new ResourceNotFoundException("One or more products not found");
        }
        new ArrayList<>(promotion.getProducts()).forEach(promotion::removeProduct);
        products.forEach(promotion::addProduct);
        promotion.setCode(dto.getCode());
        promotion.setName(dto.getName());
        promotion.setDiscountPercent(dto.getDiscountPercent());
        promotion.setStartAt(dto.getStartAt());
        promotion.setEndAt(dto.getEndAt());
        promotion.setActive(dto.getActive());
        return promotionMapper.toResponseDto(promotionRepository.save(promotion));
    }

    @Transactional
    public void deletePromotion(String id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
        new ArrayList<>(promotion.getProducts()).forEach(promotion::removeProduct);
        promotionRepository.delete(promotion);
    }

    public PromotionPerformanceResponseDto getPromotionPerformance(String id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
        int productCount = promotion.getProducts().size();
        long orderCount = promotionRepository.countOrdersByPromotion(id, promotion.getStartAt(), promotion.getEndAt());
        BigDecimal estimatedRevenue = promotionRepository.sumRevenueByPromotion(id, promotion.getStartAt(), promotion.getEndAt());
        if (estimatedRevenue == null) estimatedRevenue = BigDecimal.ZERO;
        BigDecimal estimatedDiscountAmount = estimatedRevenue
                .multiply(BigDecimal.valueOf(promotion.getDiscountPercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return PromotionPerformanceResponseDto.builder()
                .promotionId(promotion.getId())
                .code(promotion.getCode())
                .name(promotion.getName())
                .discountPercent(promotion.getDiscountPercent())
                .startAt(promotion.getStartAt())
                .endAt(promotion.getEndAt())
                .active(promotion.getActive())
                .status(promotionMapper.computeStatus(promotion))
                .productCount(productCount)
                .orderCount(orderCount)
                .estimatedRevenue(estimatedRevenue)
                .estimatedDiscountAmount(estimatedDiscountAmount)
                .build();
    }

    public PromotionSummaryResponseDto getPromotionSummary() {
        LocalDateTime now = LocalDateTime.now();
        long totalCount = promotionRepository.count();
        long activeCount = promotionRepository.countActiveNow(now);
        long totalOrderCount = promotionRepository.countTotalOrdersAcrossAllPromotions();
        BigDecimal totalEstimatedRevenue = promotionRepository.sumTotalRevenueAcrossAllPromotions();
        if (totalEstimatedRevenue == null) totalEstimatedRevenue = BigDecimal.ZERO;
        return PromotionSummaryResponseDto.builder()
                .activeCount(activeCount)
                .totalCount(totalCount)
                .totalOrderCount(totalOrderCount)
                .totalEstimatedRevenue(totalEstimatedRevenue)
                .build();
    }
}
