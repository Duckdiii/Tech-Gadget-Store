package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.response.SubscriptionResponseDto;
import com.project.tech_gadget_store.service.FavoriteProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final FavoriteProductService favoriteProductService;

    public CustomerController(FavoriteProductService favoriteProductService) {
        this.favoriteProductService = favoriteProductService;
    }

    @PostMapping("/products/{productId}/subscription")
    public ResponseEntity<SubscriptionResponseDto> toggleSubscription(
            @PathVariable String productId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(favoriteProductService.toggleSubscription(email, productId));
    }
}
