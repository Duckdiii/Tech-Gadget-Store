package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "membership_benefits")
@Getter
@Setter

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MembershipBenefit extends BaseEntity {

    @Column(name = "discount_percentage", nullable = false)
    private Double discountPercentage;

    @Column(name = "free_shipping", nullable = false)
    private Boolean freeShipping = false;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public MembershipBenefit(Double discountPercentage, Boolean freeShipping, String description) {
        if (discountPercentage == null) {
            throw new IllegalArgumentException("discountPercentage must not be null");
        }
        if (discountPercentage < 0 || discountPercentage > 100) {
            throw new IllegalArgumentException("discountPercentage must be between 0 and 100");
        }
        if (freeShipping == null) {
            throw new IllegalArgumentException("freeShipping must not be null");
        }
        this.discountPercentage = discountPercentage;
        this.freeShipping = freeShipping;
        this.description = description;
    }

    public BigDecimal calculateDiscount(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("amount must not be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("amount must not be negative");
        }
        if (discountPercentage == null) {
            throw new IllegalStateException("discountPercentage must not be null");
        }
        return amount.multiply(BigDecimal.valueOf(discountPercentage))
                .divide(BigDecimal.valueOf(100));
    }

    public boolean hasFreeShipping() {
        return Boolean.TRUE.equals(freeShipping);
    }

    public void changeDiscountPercentage(Double discountPercentage) {
        if (discountPercentage == null) {
            throw new IllegalArgumentException("discountPercentage must not be null");
        }
        if (discountPercentage < 0 || discountPercentage > 100) {
            throw new IllegalArgumentException("discountPercentage must be between 0 and 100");
        }
        this.discountPercentage = discountPercentage;
    }

    public void enableFreeShipping() {
        freeShipping = true;
    }

    public void disableFreeShipping() {
        freeShipping = false;
    }
}
