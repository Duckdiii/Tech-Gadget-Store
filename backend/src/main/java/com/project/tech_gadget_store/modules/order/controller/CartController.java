package com.project.tech_gadget_store.modules.order.controller;

import com.project.tech_gadget_store.modules.loyalty.dto.request.UpdateCartItemBundleServicesRequestDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.modules.order.dto.request.AddToCartRequestDto;
import com.project.tech_gadget_store.modules.order.dto.request.UpdateCartItemQuantityRequestDto;
import com.project.tech_gadget_store.modules.order.dto.response.CartDetailResponseDto;
import com.project.tech_gadget_store.modules.order.service.CartService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



@Validated
@RestController
@RequestMapping("/api/customer/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDetailResponseDto> getCart(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.getCart(email));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDetailResponseDto> addToCart(
            @Valid @RequestBody AddToCartRequestDto req,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.addToCart(req, email));
    }

    @PutMapping("/items/{cartItemId}/quantity")
    public ResponseEntity<CartDetailResponseDto> updateQuantity(
            @PathVariable String cartItemId,
            @Valid @RequestBody UpdateCartItemQuantityRequestDto req,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.updateQuantity(cartItemId, req.getQuantity(), email));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDetailResponseDto> removeItem(
            @PathVariable String cartItemId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.removeItem(cartItemId, email));
    }

    @GetMapping("/items/{cartItemId}/bundle-services")
    public ResponseEntity<List<BundleServiceResponseDto>> getAvailableBundleServices(
            @PathVariable String cartItemId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.getAvailableBundleServices(cartItemId, email));
    }

    @PutMapping("/items/{cartItemId}/bundle-services")
    public ResponseEntity<CartDetailResponseDto> updateBundleServices(
            @PathVariable String cartItemId,
            @Valid @RequestBody UpdateCartItemBundleServicesRequestDto req,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.updateBundleServices(cartItemId, req.getBundleServicesIds(), email));
    }
}
