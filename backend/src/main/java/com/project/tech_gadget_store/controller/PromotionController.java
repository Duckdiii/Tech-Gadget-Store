package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.PromotionRequestDto;
import com.project.tech_gadget_store.dto.response.PromotionPerformanceResponseDto;
import com.project.tech_gadget_store.dto.response.PromotionResponseDto;
import com.project.tech_gadget_store.dto.response.PromotionSummaryResponseDto;
import com.project.tech_gadget_store.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public ResponseEntity<List<PromotionResponseDto>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/summary")
    public ResponseEntity<PromotionSummaryResponseDto> getSummary() {
        return ResponseEntity.ok(promotionService.getPromotionSummary());
    }

    @PostMapping
    public ResponseEntity<PromotionResponseDto> createPromotion(@Valid @RequestBody PromotionRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionResponseDto> updatePromotion(
            @PathVariable String id,
            @Valid @RequestBody PromotionRequestDto dto) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable String id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/performance")
    public ResponseEntity<PromotionPerformanceResponseDto> getPerformance(@PathVariable String id) {
        return ResponseEntity.ok(promotionService.getPromotionPerformance(id));
    }
}
