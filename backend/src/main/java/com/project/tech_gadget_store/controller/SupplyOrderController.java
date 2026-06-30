package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.SupplyOrderRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.dto.response.SupplyOrderResponseDto;
import com.project.tech_gadget_store.entity.enums.POStatus;
import com.project.tech_gadget_store.service.SupplyOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<List<SupplyOrderResponseDto>> getAll() {
        return ResponseEntity.ok(supplyOrderService.getAll());
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
