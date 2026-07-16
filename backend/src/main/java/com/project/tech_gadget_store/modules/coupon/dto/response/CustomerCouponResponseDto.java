package com.project.tech_gadget_store.modules.coupon.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCouponResponseDto {
    private String id;
    private String couponId;
    private String code;
    private String name;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime endAt;
    private LocalDateTime claimedAt;
    private LocalDateTime usedAt;
    /** "ACTIVE" | "USED" | "EXPIRED" — tính trực tiếp từ endAt/usedAt thật, không lưu riêng. */
    private String status;
}
