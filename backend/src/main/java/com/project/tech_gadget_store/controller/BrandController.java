package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.BrandRequestDto;
import com.project.tech_gadget_store.dto.response.BrandResponseDto;
import com.project.tech_gadget_store.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<BrandResponseDto> createBrand(@Valid @RequestBody BrandRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(dto));
    }

    @GetMapping
    public ResponseEntity<List<BrandResponseDto>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponseDto> updateBrand(
            @PathVariable String id,
            @Valid @RequestBody BrandRequestDto dto) {
        return ResponseEntity.ok(brandService.updateBrand(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeBrand(@PathVariable String id) {
        brandService.removeBrand(id);
        return ResponseEntity.noContent().build();
    }
}
