package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.catalog.dto.response.RecommendationExperimentSummaryDto;
import com.project.tech_gadget_store.modules.catalog.service.RecommendationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Báo cáo A/B test "Dành cho bạn" (MF vs rule-based holdout) cho Manager — xem RecommendationService. */
@RestController
@RequestMapping("/api/manager/recommendation-experiment")
public class RecommendationExperimentController {

    private final RecommendationService recommendationService;

    public RecommendationExperimentController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/summary")
    public ResponseEntity<List<RecommendationExperimentSummaryDto>> getSummary() {
        return ResponseEntity.ok(recommendationService.getExperimentSummary());
    }
}
