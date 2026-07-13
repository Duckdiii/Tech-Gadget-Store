package com.project.tech_gadget_store.modules.catalog.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Response riêng cho {@code GET /api/products/for-you} — khác các endpoint gợi ý khác (vẫn trả
 * {@code List<ProductResponseDto>} trần) vì cần mang thêm variant thử nghiệm A/B (xem
 * {@code RecommendationExperimentLog}). {@code variant} null nghĩa là khách cold-start, không
 * thuộc thử nghiệm (xem {@code RecommendationService}).
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForYouRecommendationResponseDto {
    private String variant;
    private List<ForYouItemDto> items;
}
