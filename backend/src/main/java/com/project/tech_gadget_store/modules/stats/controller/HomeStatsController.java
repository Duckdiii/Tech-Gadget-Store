package com.project.tech_gadget_store.modules.stats.controller;

import com.project.tech_gadget_store.modules.stats.dto.response.HomeStatsResponseDto;
import com.project.tech_gadget_store.modules.stats.service.HomeStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class HomeStatsController {

    private final HomeStatsService homeStatsService;

    public HomeStatsController(HomeStatsService homeStatsService) {
        this.homeStatsService = homeStatsService;
    }

    @GetMapping("/homepage")
    public ResponseEntity<HomeStatsResponseDto> getHomepageStats() {
        return ResponseEntity.ok(homeStatsService.getHomeStats());
    }
}
