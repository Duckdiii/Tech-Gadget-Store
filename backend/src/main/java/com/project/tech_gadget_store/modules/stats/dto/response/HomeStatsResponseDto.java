package com.project.tech_gadget_store.modules.stats.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeStatsResponseDto {
    private long totalProducts;
    private long totalCustomers;
    private long totalReviews;
    private Double averageRating;
}
