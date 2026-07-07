package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.response.CustomerMembershipResponseDto;
import com.project.tech_gadget_store.dto.response.MembershipTierResponseDto;
import com.project.tech_gadget_store.dto.response.SubscriptionResponseDto;
import com.project.tech_gadget_store.service.CustomerService;
import com.project.tech_gadget_store.service.FavoriteProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
