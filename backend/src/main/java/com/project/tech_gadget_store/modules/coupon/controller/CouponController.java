package com.project.tech_gadget_store.modules.coupon.controller;

import com.project.tech_gadget_store.common.constants.ErrorMessages;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.coupon.dto.response.CouponResponseDto;
import com.project.tech_gadget_store.modules.coupon.dto.response.CustomerCouponResponseDto;
import com.project.tech_gadget_store.modules.coupon.service.CouponService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/coupons")
public class CouponController {

    private final CouponService couponService;
    private final CustomerRepository customerRepository;

    public CouponController(CouponService couponService, CustomerRepository customerRepository) {
        this.couponService = couponService;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/available")
    public ResponseEntity<List<CouponResponseDto>> getAvailableCoupons(Authentication authentication) {
        return ResponseEntity.ok(couponService.getAvailableCoupons(resolveCustomerId(authentication)));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<CustomerCouponResponseDto>> getMyCoupons(Authentication authentication) {
        return ResponseEntity.ok(couponService.getMyCoupons(resolveCustomerId(authentication)));
    }

    @PostMapping("/{couponId}/claim")
    public ResponseEntity<CustomerCouponResponseDto> claimCoupon(@PathVariable String couponId, Authentication authentication) {
        CustomerCouponResponseDto result = couponService.claimCoupon(resolveCustomerId(authentication), couponId);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    private String resolveCustomerId(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND));
        return customer.getId();
    }
}
