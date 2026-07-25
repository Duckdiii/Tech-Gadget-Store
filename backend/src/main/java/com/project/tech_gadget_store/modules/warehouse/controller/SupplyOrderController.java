package com.project.tech_gadget_store.modules.warehouse.controller;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.entity.enums.POStatus;
import com.project.tech_gadget_store.modules.warehouse.dto.request.SupplyOrderRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.SupplyOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.SupplyOrderResponseDto;
import com.project.tech_gadget_store.modules.warehouse.service.SupplyOrderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/manager/supply-orders")
@RequiredArgsConstructor
public class SupplyOrderController {

    private final SupplyOrderService supplyOrderService;

    @PostMapping
    public ResponseEntity<SupplyOrderResponseDto> createSupplyOrder(@Valid @RequestBody SupplyOrderRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplyOrderService.createSupplyOrder(dto));
    }

    @GetMapping
    public ResponseEntity<com.project.tech_gadget_store.common.dto.CursorPageResponseDto<SupplyOrderResponseDto>> getAll(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(supplyOrderService.getAllCursor(cursor, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplyOrderResponseDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(supplyOrderService.getById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupplyOrderResponseDto>> getByStatus(@PathVariable POStatus status) {
        return ResponseEntity.ok(supplyOrderService.getByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SupplyOrderResponseDto> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody SupplyOrderStatusUpdateRequestDto dto) {
        return ResponseEntity.ok(supplyOrderService.updateStatus(id, dto));
    }
}
