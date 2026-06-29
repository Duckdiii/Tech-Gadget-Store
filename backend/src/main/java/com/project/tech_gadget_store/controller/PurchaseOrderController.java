package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.PurchaseOrderRequestDto;
import com.project.tech_gadget_store.dto.request.PurchaseOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.dto.response.PurchaseOrderResponseDto;
import com.project.tech_gadget_store.entity.enums.PurchaseOrderStatus;
import com.project.tech_gadget_store.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public ResponseEntity<PurchaseOrderResponseDto> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseOrderService.createPurchaseOrder(dto));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponseDto>> getAll() {
        return ResponseEntity.ok(purchaseOrderService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(purchaseOrderService.getById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrderResponseDto>> getByStatus(@PathVariable PurchaseOrderStatus status) {
        return ResponseEntity.ok(purchaseOrderService.getByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderResponseDto> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody PurchaseOrderStatusUpdateRequestDto dto) {
        return ResponseEntity.ok(purchaseOrderService.updateStatus(id, dto));
    }
}
