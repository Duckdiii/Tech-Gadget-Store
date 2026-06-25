package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.ImportLogRequestDto;
import com.project.tech_gadget_store.dto.response.ImportLogResponseDto;
import com.project.tech_gadget_store.service.ImportLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/import-logs")
public class ImportLogController {

    private final ImportLogService importLogService;

    public ImportLogController(ImportLogService importLogService) {
        this.importLogService = importLogService;
    }

    @PostMapping
    public ResponseEntity<ImportLogResponseDto> importProducts(@Valid @RequestBody ImportLogRequestDto requestDto) {
        ImportLogResponseDto response = importLogService.importProducts(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ImportLogResponseDto>> getAll() {
        List<ImportLogResponseDto> response = importLogService.getAllImportLogs();
        return ResponseEntity.ok(response);
    }
}
