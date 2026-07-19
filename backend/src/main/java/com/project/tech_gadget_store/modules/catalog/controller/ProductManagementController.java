package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.catalog.dto.request.ProductImageRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductVariantRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductImageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductStatsResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductVariantResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.ProductManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/manager/products")
@RequiredArgsConstructor
public class ProductManagementController {

    private final ProductManagementService productManagementService;

    @GetMapping("/stats")
    public ResponseEntity<ProductStatsResponseDto> getStats() {
        return ResponseEntity.ok(productManagementService.getProductStats());
    }

    @PostMapping
    public ResponseEntity<ProductDetailResponseDto> createProduct(@Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productManagementService.createProduct(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailResponseDto> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.ok(productManagementService.updateProduct(id, dto));
    }

    @PatchMapping("/{id}/discontinue")
    public ResponseEntity<Void> discontinueProduct(@PathVariable String id) {
        productManagementService.discontinueProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateProduct(@PathVariable String id) {
        productManagementService.reactivateProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/variants")
    public ResponseEntity<ProductVariantResponseDto> addVariant(
            @PathVariable String id,
            @Valid @RequestBody ProductVariantRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productManagementService.addVariant(id, dto));
    }

    @PutMapping("/{id}/variants/{variantId}")
    public ResponseEntity<ProductVariantResponseDto> updateVariant(
            @PathVariable String id,
            @PathVariable String variantId,
            @Valid @RequestBody ProductVariantRequestDto dto) {
        return ResponseEntity.ok(productManagementService.updateVariant(id, variantId, dto));
    }

    @DeleteMapping("/{id}/variants/{variantId}")
    public ResponseEntity<Void> removeVariant(@PathVariable String id, @PathVariable String variantId) {
        productManagementService.removeVariant(id, variantId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ProductImageResponseDto> addImage(
            @PathVariable String id,
            @Valid @RequestBody ProductImageRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productManagementService.addImage(id, dto));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> removeImage(@PathVariable String id, @PathVariable String imageId) {
        productManagementService.removeImage(id, imageId);
        return ResponseEntity.noContent().build();
    }
}
