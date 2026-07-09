package com.project.tech_gadget_store.modules.warehouse.controller;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ImportLogRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.ImportLogResponseDto;
import com.project.tech_gadget_store.modules.warehouse.service.ImportLogService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



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
    public ResponseEntity<com.project.tech_gadget_store.common.dto.CursorPageResponseDto<ImportLogResponseDto>> getAll(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        com.project.tech_gadget_store.common.dto.CursorPageResponseDto<ImportLogResponseDto> response = importLogService.getImportLogsCursor(cursor, limit);
        return ResponseEntity.ok(response);
    }
}
