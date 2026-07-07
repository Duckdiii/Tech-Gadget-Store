package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.BundleServiceRequestDto;
import com.project.tech_gadget_store.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.service.BundleServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/bundle-services")
@RequiredArgsConstructor
public class BundleServiceController {

    private final BundleServiceService bundleServiceService;

    @PostMapping
    public ResponseEntity<BundleServiceResponseDto> createBundleService(@Valid @RequestBody BundleServiceRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bundleServiceService.createBundleService(dto));
    }

    @GetMapping
    public ResponseEntity<List<BundleServiceResponseDto>> getAllBundleServices() {
        return ResponseEntity.ok(bundleServiceService.getAllBundleServices());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BundleServiceResponseDto> updateBundleService(
            @PathVariable String id,
            @Valid @RequestBody BundleServiceRequestDto dto) {
        return ResponseEntity.ok(bundleServiceService.updateBundleService(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeBundleService(@PathVariable String id) {
        bundleServiceService.removeBundleService(id);
        return ResponseEntity.noContent().build();
    }
}
