package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.response.CustomerMembershipResponseDto;
import com.project.tech_gadget_store.dto.response.FavoriteProductPageResponseDto;
import com.project.tech_gadget_store.dto.response.FavoriteResponseDto;
import com.project.tech_gadget_store.dto.response.MembershipTierResponseDto;
import com.project.tech_gadget_store.dto.response.SubscriptionResponseDto;
import com.project.tech_gadget_store.service.CustomerService;
import com.project.tech_gadget_store.service.FavoriteProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final FavoriteProductService favoriteProductService;
    private final CustomerService customerService;

    public CustomerController(FavoriteProductService favoriteProductService, CustomerService customerService) {
        this.favoriteProductService = favoriteProductService;
        this.customerService = customerService;
    }

    @PostMapping("/products/{productId}/subscription")
    public ResponseEntity<SubscriptionResponseDto> toggleSubscription(
            @PathVariable String productId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(favoriteProductService.toggleSubscription(email, productId));
    }

    @PostMapping("/products/{productId}/favorite")
    public ResponseEntity<FavoriteResponseDto> toggleFavorite(
            @PathVariable String productId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(favoriteProductService.toggleFavorite(email, productId));
    }

    @GetMapping("/favorites")
    public ResponseEntity<FavoriteProductPageResponseDto> getMyFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(favoriteProductService.getFavoriteProductsPage(email, page, size));
    }

    @GetMapping("/membership")
    public ResponseEntity<CustomerMembershipResponseDto> getMyMembership(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(customerService.getMyMembership(email));
    }

    @GetMapping("/membership/tiers")
    public ResponseEntity<List<MembershipTierResponseDto>> getMembershipTiers() {
        return ResponseEntity.ok(customerService.getMembershipTiers());
    }
}
