package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions", uniqueConstraints = @UniqueConstraint(name = "uk_promotions_code", columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Promotion extends BaseEntity {

        @Column(name = "code", nullable = false, length = 80)
        private String code;

        @Column(name = "name", nullable = false, length = 150)
        private String name;

        @Column(name = "discount_percent", nullable = false)
        private Double discountPercent;

        @Column(name = "start_at", nullable = false)
        private LocalDateTime startAt;

        @Column(name = "end_at", nullable = false)
        private LocalDateTime endAt;

        @Column(name = "active", nullable = false)
        private Boolean active = true;

        public Promotion(String code, String name, Double discountPercent, LocalDateTime startAt, LocalDateTime endAt,
                        Product product) {
                if (code == null || code.isBlank()) {
                        throw new IllegalArgumentException("code must not be blank");
                }
                if (name == null || name.isBlank()) {
                        throw new IllegalArgumentException("name must not be blank");
                }
                if (discountPercent == null) {
                        throw new IllegalArgumentException("discountPercent must not be null");
                }
                if (discountPercent < 0 || discountPercent > 100) {
                        throw new IllegalArgumentException("discountPercent must be between 0 and 100");
                }
                if (startAt == null) {
                        throw new IllegalArgumentException("startAt must not be null");
                }
                if (endAt == null) {
                        throw new IllegalArgumentException("endAt must not be null");
                }
                if (endAt.isBefore(startAt)) {
                        throw new IllegalArgumentException("endAt must not be before startAt");
                }
                if (product == null) {
                        throw new IllegalArgumentException("product must not be null");
                }
                this.code = code;
                this.name = name;
                this.discountPercent = discountPercent;
                this.startAt = startAt;
                this.endAt = endAt;
                assignProduct(product);
        }

        public void assignProduct(Product product) {
                if (product == null) {
                        throw new IllegalArgumentException("product must not be null");
                }
                if (!product.getPromotions().contains(this)) {
                        product.getPromotions().add(this);
                }
        }

        public boolean isActiveNow() {
                LocalDateTime now = LocalDateTime.now();
                return Boolean.TRUE.equals(active)
                                && (now.isEqual(startAt) || now.isAfter(startAt))
                                && (now.isEqual(endAt) || now.isBefore(endAt));
        }

        public boolean canApplyTo(Product product) {
                return product != null && isActiveNow() && product.getPromotions().contains(this);
        }

        public BigDecimal calculateDiscount(BigDecimal amount) {
                if (amount == null) {
                        throw new IllegalArgumentException("amount must not be null");
                }
                if (amount.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException("amount must not be negative");
                }
                if (discountPercent == null) {
                        throw new IllegalStateException("discountPercent must not be null");
                }
                return amount.multiply(BigDecimal.valueOf(discountPercent))
                                .divide(BigDecimal.valueOf(100));
        }

        public void activate() {
                active = true;
        }

        public void deactivate() {
                active = false;
        }
}
