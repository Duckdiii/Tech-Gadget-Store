package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.WarehouseLogFilterRequestDto;
import com.project.tech_gadget_store.dto.response.WarehouseLogResponseDto;
import com.project.tech_gadget_store.service.WarehouseLogService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/warehouse-logs")
public class WarehouseLogController {

    private final WarehouseLogService warehouseLogService;

    public WarehouseLogController(WarehouseLogService warehouseLogService) {
        this.warehouseLogService = warehouseLogService;
    }

    @GetMapping
    public ResponseEntity<List<WarehouseLogResponseDto>> getWarehouseLogs(
            @ModelAttribute WarehouseLogFilterRequestDto filter) {
        return ResponseEntity.ok(warehouseLogService.getWarehouseLogs(filter));
    }

    @GetMapping("/{logItemId}")
    public ResponseEntity<WarehouseLogResponseDto> getLogDetails(@PathVariable String logItemId) {
        return ResponseEntity.ok(warehouseLogService.getLogDetails(logItemId));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportWarehouseLogs(@ModelAttribute WarehouseLogFilterRequestDto filter) {
        String csv = warehouseLogService.exportWarehouseLogsToCsv(filter);
        byte[] data = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"warehouse_logs.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }
}
