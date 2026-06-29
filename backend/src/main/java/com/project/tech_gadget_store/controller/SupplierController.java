package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.SupplierRequestDto;
import com.project.tech_gadget_store.dto.response.SupplierResponseDto;
import com.project.tech_gadget_store.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierResponseDto> createSupplier(@Valid @RequestBody SupplierRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.createSupplier(dto));
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponseDto>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponseDto> updateSupplier(
            @PathVariable String id,
            @Valid @RequestBody SupplierRequestDto dto) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeSupplier(@PathVariable String id) {
        supplierService.removeSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
