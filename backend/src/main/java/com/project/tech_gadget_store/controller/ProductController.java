package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponseDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(productService.viewDetailProduct(id));
    }

    @GetMapping("/flash-sale-today")
    public ResponseEntity<List<FlashSaleProductResponseDto>> getTodayFlashSaleProducts() {
        return ResponseEntity.ok(productService.findTodayFlashSaleProducts());
    }

    @GetMapping("/filter")
    public ResponseEntity<ProductPageResponseDto> getByFilter(
            @Valid @ModelAttribute ProductFilterRequestDto filter) {
        return ResponseEntity.ok(productService.findProductsByFilter(filter));
    }
}
