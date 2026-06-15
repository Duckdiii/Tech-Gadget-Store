package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("COD")
@Getter
@Setter

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CODPaymentMethod extends PaymentMethod {

    @Column(name = "max_amount", precision = 15, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "service_fee", precision = 15, scale = 2)
    private BigDecimal serviceFee;

    public CODPaymentMethod(String name, String description, BigDecimal maxAmount, BigDecimal serviceFee) {
        super(name, description);
        this.maxAmount = maxAmount;
        this.serviceFee = serviceFee;
    }

    public boolean isAmountAllowed(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("amount must not be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("amount must not be negative");
        }
        return maxAmount == null || amount.compareTo(maxAmount) <= 0;
    }

    public BigDecimal calculateServiceFee(BigDecimal amount) {
        if (!isAmountAllowed(amount)) {
            throw new IllegalArgumentException("amount exceeds COD limit");
        }
        return serviceFee == null ? BigDecimal.ZERO : serviceFee;
    }

    public void changeLimit(BigDecimal maxAmount) {
        if (maxAmount != null && maxAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("maxAmount must not be negative");
        }
        this.maxAmount = maxAmount;
    }

    public void changeServiceFee(BigDecimal serviceFee) {
        if (serviceFee == null) {
            throw new IllegalArgumentException("serviceFee must not be null");
        }
        if (serviceFee.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("serviceFee must not be negative");
        }
        this.serviceFee = serviceFee;
    }
}
