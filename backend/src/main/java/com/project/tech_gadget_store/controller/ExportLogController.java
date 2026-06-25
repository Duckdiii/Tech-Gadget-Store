package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.ExportLogRequestDto;
import com.project.tech_gadget_store.dto.response.ExportLogResponseDto;
import com.project.tech_gadget_store.service.ExportLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/export-logs")
public class ExportLogController {

    private final ExportLogService exportLogService;

    public ExportLogController(ExportLogService exportLogService) {
        this.exportLogService = exportLogService;
    }

    @PostMapping
    public ResponseEntity<ExportLogResponseDto> exportProducts(@Valid @RequestBody ExportLogRequestDto requestDto) {
        ExportLogResponseDto response = exportLogService.exportProducts(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ExportLogResponseDto>> getAll() {
        List<ExportLogResponseDto> response = exportLogService.getAllExportLogs();
        return ResponseEntity.ok(response);
    }
}
