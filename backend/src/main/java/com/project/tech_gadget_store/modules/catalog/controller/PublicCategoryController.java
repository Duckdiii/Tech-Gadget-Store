package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.catalog.dto.response.CategoryResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.CategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public, read-only category listing — used to render category list on the storefront filter panel. */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
