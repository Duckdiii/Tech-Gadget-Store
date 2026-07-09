package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.common.dto.request.UpdateProfileRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.request.AddressRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.auth.service.CustomerService;
import com.project.tech_gadget_store.modules.catalog.dto.response.FavoriteProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FavoriteResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.FavoriteProductService;
import com.project.tech_gadget_store.modules.loyalty.dto.response.CustomerMembershipResponseDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.MembershipTierResponseDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.SubscriptionResponseDto;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;



@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final FavoriteProductService favoriteProductService;
    private final CustomerService customerService;
    private final CustomerRepository customerRepository;

    public CustomerController(FavoriteProductService favoriteProductService,
                              CustomerService customerService,
                              CustomerRepository customerRepository) {
        this.favoriteProductService = favoriteProductService;
        this.customerService = customerService;
        this.customerRepository = customerRepository;
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

    @GetMapping("/profile")
    public ResponseEntity<CustomerResponseDto> showMyProfile(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        return ResponseEntity.ok(customerService.showCustomerProfile(customer.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<CustomerResponseDto> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDto request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(customerService.updateProfile(email, request));
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressResponseDto> addAddress(
            @Valid @RequestBody AddressRequestDto request,
            Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        request.setUserId(customer.getId());
        return ResponseEntity.ok(customerService.addAddress(request));
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<AddressResponseDto> updateAddress(
            @PathVariable String addressId,
            @Valid @RequestBody AddressRequestDto request,
            Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        request.setUserId(customer.getId());
        return ResponseEntity.ok(customerService.updateAddress(addressId, request));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable String addressId,
            Authentication authentication) {
        String email = authentication.getName();
        customerService.deleteAddress(email, addressId);
        return ResponseEntity.ok().build();
    }
}
