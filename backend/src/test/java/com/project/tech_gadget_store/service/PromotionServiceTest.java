package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PromotionRequestDto;
import com.project.tech_gadget_store.dto.response.PromotionPerformanceResponseDto;
import com.project.tech_gadget_store.dto.response.PromotionResponseDto;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.Promotion;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.PromotionMapper;
import com.project.tech_gadget_store.repository.ProductRepository;
import com.project.tech_gadget_store.repository.PromotionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PromotionMapper promotionMapper;

    @InjectMocks
    private PromotionService promotionService;

    private PromotionRequestDto validDto() {
        return PromotionRequestDto.builder()
                .code("SUMMER24")
                .name("Sale Mùa Hè")
                .discountPercent(10.0)
                .startAt(LocalDateTime.now().plusDays(1))
                .endAt(LocalDateTime.now().plusDays(30))
                .active(true)
                .productIds(List.of("prod-1", "prod-2"))
                .build();
    }

    @Test
    void createPromotion_success() {
        PromotionRequestDto dto = validDto();
        Product p1 = mock(Product.class);
        Product p2 = mock(Product.class);
        when(p1.getPromotions()).thenReturn(new ArrayList<>());
        when(p2.getPromotions()).thenReturn(new ArrayList<>());
        Promotion savedPromotion = mock(Promotion.class);
        PromotionResponseDto expectedDto = mock(PromotionResponseDto.class);

        when(promotionRepository.existsByCode(dto.getCode())).thenReturn(false);
        when(productRepository.findAllById(dto.getProductIds())).thenReturn(List.of(p1, p2));
        when(promotionRepository.save(any(Promotion.class))).thenReturn(savedPromotion);
        when(promotionMapper.toResponseDto(savedPromotion)).thenReturn(expectedDto);

        PromotionResponseDto result = promotionService.createPromotion(dto);

        assertThat(result).isEqualTo(expectedDto);
        verify(promotionRepository).save(any(Promotion.class));
    }

    @Test
    void createPromotion_duplicateCode_throwsDuplicateResourceException() {
        PromotionRequestDto dto = validDto();
        when(promotionRepository.existsByCode(dto.getCode())).thenReturn(true);

        assertThatThrownBy(() -> promotionService.createPromotion(dto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("SUMMER24");
    }

    @Test
    void createPromotion_endAtBeforeStartAt_throwsIllegalArgumentException() {
        PromotionRequestDto dto = PromotionRequestDto.builder()
                .code("CODE1")
                .name("Test")
                .discountPercent(10.0)
                .startAt(LocalDateTime.now().plusDays(10))
                .endAt(LocalDateTime.now().plusDays(1))
                .active(true)
                .productIds(List.of("prod-1"))
                .build();
        when(promotionRepository.existsByCode(anyString())).thenReturn(false);

        assertThatThrownBy(() -> promotionService.createPromotion(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("endAt must be after startAt");
    }

    @Test
    void createPromotion_productNotFound_throwsResourceNotFoundException() {
        PromotionRequestDto dto = validDto();
        when(promotionRepository.existsByCode(dto.getCode())).thenReturn(false);
        when(productRepository.findAllById(dto.getProductIds())).thenReturn(List.of(mock(Product.class)));

        assertThatThrownBy(() -> promotionService.createPromotion(dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("products not found");
    }

    @Test
    void updatePromotion_success() {
        String promotionId = "promo-1";
        PromotionRequestDto dto = validDto();
        Product p1 = mock(Product.class);
        Product p2 = mock(Product.class);
        Promotion existing = mock(Promotion.class);
        when(existing.getProducts()).thenReturn(new ArrayList<>());
        Promotion saved = mock(Promotion.class);
        PromotionResponseDto expectedDto = mock(PromotionResponseDto.class);

        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existing));
        when(promotionRepository.existsByCodeAndIdNot(dto.getCode(), promotionId)).thenReturn(false);
        when(productRepository.findAllById(dto.getProductIds())).thenReturn(List.of(p1, p2));
        when(promotionRepository.save(existing)).thenReturn(saved);
        when(promotionMapper.toResponseDto(saved)).thenReturn(expectedDto);

        PromotionResponseDto result = promotionService.updatePromotion(promotionId, dto);

        assertThat(result).isEqualTo(expectedDto);
        verify(existing).setCode(dto.getCode());
        verify(existing).setName(dto.getName());
        verify(existing).setDiscountPercent(dto.getDiscountPercent());
        verify(promotionRepository).save(existing);
    }

    @Test
    void updatePromotion_notFound_throwsResourceNotFoundException() {
        when(promotionRepository.findById("missing-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> promotionService.updatePromotion("missing-id", validDto()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing-id");
    }

    @Test
    void deletePromotion_success() {
        String promotionId = "promo-1";
        Promotion promotion = mock(Promotion.class);
        when(promotion.getProducts()).thenReturn(new ArrayList<>());
        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(promotion));

        promotionService.deletePromotion(promotionId);

        verify(promotionRepository).delete(promotion);
    }

    @Test
    void getPromotionPerformance_success() {
        String promotionId = "promo-1";
        LocalDateTime start = LocalDateTime.now().minusDays(10);
        LocalDateTime end = LocalDateTime.now().plusDays(20);
        Promotion promotion = mock(Promotion.class);
        when(promotion.getId()).thenReturn(promotionId);
        when(promotion.getCode()).thenReturn("SUMMER24");
        when(promotion.getName()).thenReturn("Sale Mùa Hè");
        when(promotion.getDiscountPercent()).thenReturn(10.0);
        when(promotion.getStartAt()).thenReturn(start);
        when(promotion.getEndAt()).thenReturn(end);
        when(promotion.getActive()).thenReturn(true);
        when(promotion.getProducts()).thenReturn(List.of(mock(Product.class), mock(Product.class)));

        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(promotion));
        when(promotionRepository.countOrdersByPromotion(promotionId, start, end)).thenReturn(5L);
        when(promotionRepository.sumRevenueByPromotion(promotionId, start, end))
                .thenReturn(new BigDecimal("10000000"));
        when(promotionMapper.computeStatus(promotion)).thenReturn("ACTIVE");

        PromotionPerformanceResponseDto result = promotionService.getPromotionPerformance(promotionId);

        assertThat(result.getOrderCount()).isEqualTo(5L);
        assertThat(result.getProductCount()).isEqualTo(2);
        assertThat(result.getEstimatedRevenue()).isEqualByComparingTo("10000000");
        assertThat(result.getEstimatedDiscountAmount()).isEqualByComparingTo("1000000.00");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
    }
}
