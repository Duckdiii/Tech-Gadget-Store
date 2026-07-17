package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.modules.auth.dto.response.CustomerStatsResponseDto;
import com.project.tech_gadget_store.modules.auth.service.CustomerStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


/**
 * Manager-only endpoint for period-scoped customer counts (new customers in a date range,
 * plus lifetime total) — needed by the Manager Dashboard KPI cards, which otherwise have no
 * way to know how many customers signed up in a given window (the only pre-existing endpoint,
 * {@code GET /api/stats/homepage}, only exposes a lifetime total with no date filtering).
 */
@RestController
@RequestMapping("/api/manager/customer-stats")
public class CustomerStatsController {

    private final CustomerStatsService customerStatsService;

    public CustomerStatsController(CustomerStatsService customerStatsService) {
        this.customerStatsService = customerStatsService;
    }

    @GetMapping
    public ResponseEntity<CustomerStatsResponseDto> getStats(
            @RequestParam String startDate, @RequestParam String endDate) {
        return ResponseEntity.ok(customerStatsService.getStats(startDate, endDate));
    }
}
