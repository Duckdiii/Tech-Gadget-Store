package com.project.tech_gadget_store.modules.warehouse.controller;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ExportLogRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.ExportLogResponseDto;
import com.project.tech_gadget_store.modules.warehouse.service.ExportLogService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



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
    public ResponseEntity<com.project.tech_gadget_store.common.dto.CursorPageResponseDto<ExportLogResponseDto>> getAll(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        com.project.tech_gadget_store.common.dto.CursorPageResponseDto<ExportLogResponseDto> response = exportLogService.getExportLogsCursor(cursor, limit);
        return ResponseEntity.ok(response);
    }
}
