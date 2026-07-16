package com.project.tech_gadget_store.modules.coupon.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.coupon.entity.enums.DiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupons", uniqueConstraints = @UniqueConstraint(name = "uk_coupons_code", columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Coupon extends BaseEntity {

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    @Column(name = "min_order_amount")
    private BigDecimal minOrderAmount;

    @Column(name = "max_discount_amount")
    private BigDecimal maxDiscountAmount;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    /** Tổng số lượt claim tối đa trên toàn hệ thống — null nghĩa là không giới hạn. */
    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public boolean isCurrentlyValid() {
        LocalDateTime now = LocalDateTime.now();
        return Boolean.TRUE.equals(active) && !now.isBefore(startAt) && !now.isAfter(endAt);
    }
}
