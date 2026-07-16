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
public class CouponResponseDto {
    private String id;
    private String code;
    private String name;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    /** true nếu khách hàng đang gọi API đã lưu (claim) coupon này rồi. */
    private boolean claimed;
}
