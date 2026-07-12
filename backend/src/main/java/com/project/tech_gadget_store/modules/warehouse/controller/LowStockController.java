package com.project.tech_gadget_store.modules.warehouse.controller;

import com.project.tech_gadget_store.modules.warehouse.dto.response.LowStockSummaryResponseDto;
import com.project.tech_gadget_store.modules.warehouse.service.LowStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/warehouse/low-stock-products")
@RequiredArgsConstructor
public class LowStockController {

    private final LowStockService lowStockService;

    @GetMapping
    public LowStockSummaryResponseDto getLowStockProducts(@RequestParam(defaultValue = "10") int limit) {
        return lowStockService.getLowStockSummary(limit);
    }
}
