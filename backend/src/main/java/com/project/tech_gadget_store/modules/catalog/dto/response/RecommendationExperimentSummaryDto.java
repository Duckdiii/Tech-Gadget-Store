package com.project.tech_gadget_store.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Số liệu tổng hợp 1 variant trong thử nghiệm A/B — xem manager-analytics. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationExperimentSummaryDto {
    private String variant;
    private long shownCount;
    private long clickedCount;
    private double ctr;
}
