package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public, read-only brand listing — used to render brand logos/names on the storefront. */
@RestController
@RequestMapping("/api/brands")
public class PublicBrandController {

    private final BrandRepository brandRepository;

    public PublicBrandController(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @GetMapping
    public ResponseEntity<List<String>> getBrandNames() {
        List<String> names = brandRepository.findAll().stream()
                .map(Brand::getName)
                .sorted(Comparator.naturalOrder())
                .toList();
        return ResponseEntity.ok(names);
    }
}
