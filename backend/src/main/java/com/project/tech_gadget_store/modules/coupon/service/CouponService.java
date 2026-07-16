package com.project.tech_gadget_store.modules.coupon.service;

import com.project.tech_gadget_store.common.exception.ForbiddenException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.coupon.dto.response.CouponResponseDto;
import com.project.tech_gadget_store.modules.coupon.dto.response.CustomerCouponResponseDto;
import com.project.tech_gadget_store.modules.coupon.entity.Coupon;
import com.project.tech_gadget_store.modules.coupon.entity.CustomerCoupon;
import com.project.tech_gadget_store.modules.coupon.repository.CouponRepository;
import com.project.tech_gadget_store.modules.coupon.repository.CustomerCouponRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;
    private final CustomerCouponRepository customerCouponRepository;
    private final CustomerRepository customerRepository;

    public CouponService(CouponRepository couponRepository,
            CustomerCouponRepository customerCouponRepository,
            CustomerRepository customerRepository) {
        this.couponRepository = couponRepository;
        this.customerCouponRepository = customerCouponRepository;
        this.customerRepository = customerRepository;
    }

    public List<CouponResponseDto> getAvailableCoupons(String customerId) {
        Set<String> claimedCouponIds = customerCouponRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(cc -> cc.getCoupon().getId()).collect(Collectors.toSet());

        return couponRepository.findCurrentlyValid(LocalDateTime.now()).stream()
                .map(c -> toCouponResponseDto(c, claimedCouponIds.contains(c.getId())))
                .toList();
    }

    public List<CustomerCouponResponseDto> getMyCoupons(String customerId) {
        return customerCouponRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toCustomerCouponResponseDto)
                .toList();
    }

    @Transactional
    public CustomerCouponResponseDto claimCoupon(String customerId, String couponId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + couponId));

        if (!coupon.isCurrentlyValid()) {
            throw new ForbiddenException("Mã giảm giá này không còn hiệu lực.");
        }

        if (customerCouponRepository.findByCustomerIdAndCouponId(customerId, couponId).isPresent()) {
            throw new ForbiddenException("Bạn đã lưu mã giảm giá này rồi.");
        }

        if (coupon.getUsageLimit() != null && customerCouponRepository.countByCouponId(couponId) >= coupon.getUsageLimit()) {
            throw new ForbiddenException("Mã giảm giá đã hết lượt sử dụng.");
        }

        CustomerCoupon saved = customerCouponRepository.save(new CustomerCoupon(customer, coupon));
        return toCustomerCouponResponseDto(saved);
    }

    private CouponResponseDto toCouponResponseDto(Coupon c, boolean claimed) {
        return CouponResponseDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .description(c.getDescription())
                .discountType(c.getDiscountType().name())
                .discountValue(c.getDiscountValue())
                .minOrderAmount(c.getMinOrderAmount())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .startAt(c.getStartAt())
                .endAt(c.getEndAt())
                .claimed(claimed)
                .build();
    }

    private CustomerCouponResponseDto toCustomerCouponResponseDto(CustomerCoupon cc) {
        Coupon c = cc.getCoupon();
        String status;
        if (cc.getUsedAt() != null) {
            status = "USED";
        } else if (LocalDateTime.now().isAfter(c.getEndAt())) {
            status = "EXPIRED";
        } else {
            status = "ACTIVE";
        }

        return CustomerCouponResponseDto.builder()
                .id(cc.getId())
                .couponId(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .description(c.getDescription())
                .discountType(c.getDiscountType().name())
                .discountValue(c.getDiscountValue())
                .minOrderAmount(c.getMinOrderAmount())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .endAt(c.getEndAt())
                .claimedAt(cc.getCreatedAt())
                .usedAt(cc.getUsedAt())
                .status(status)
                .build();
    }
}
