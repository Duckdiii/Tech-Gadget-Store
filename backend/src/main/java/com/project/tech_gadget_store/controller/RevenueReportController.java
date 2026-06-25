package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.RevenueReportFilterRequestDto;
import com.project.tech_gadget_store.dto.response.RevenueReportResponseDto;
import com.project.tech_gadget_store.service.RevenueReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/manager/revenue-report")
public class RevenueReportController {

    private final RevenueReportService revenueReportService;

    public RevenueReportController(RevenueReportService revenueReportService) {
        this.revenueReportService = revenueReportService;
    }

    @GetMapping
    public ResponseEntity<RevenueReportResponseDto> getRevenueReport(
            @ModelAttribute RevenueReportFilterRequestDto filter) {
        return ResponseEntity.ok(revenueReportService.getRevenueReport(filter));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportRevenueReport(
            @ModelAttribute RevenueReportFilterRequestDto filter) {
        String csv = revenueReportService.exportRevenueReportToCsv(filter);
        byte[] data = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"revenue_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }
}
