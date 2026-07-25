package com.project.tech_gadget_store.modules.loyalty.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Table(name = "promotions", uniqueConstraints = @UniqueConstraint(name = "uk_promotions_code", columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Promotion extends BaseEntity {

        @JsonIgnore
        @ManyToMany(mappedBy = "promotions", fetch = FetchType.LAZY)
        private List<Product> products = new ArrayList<>();

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

        @Setter(AccessLevel.NONE)
        @Column(name = "active", nullable = false)
        private Boolean active = true;

        @Column(name = "usage_limit", nullable = false)
        private int usageLimit;

        @Column(name = "image_url")
        private String imageUrl;

        @ElementCollection(fetch = FetchType.EAGER)
        @CollectionTable(name = "promotion_target_tiers", joinColumns = @JoinColumn(name = "promotion_id"))
        @Column(name = "tier")
        private List<String> targetTiers = new ArrayList<>();

        public Promotion(String code, String name, Double discountPercent, LocalDateTime startAt, LocalDateTime endAt,
                        Boolean active, Product product) {
                if (code == null || code.isBlank()) {
                        throw new IllegalArgumentException("code must not be blank");
                }
                if (name == null || name.isBlank()) {
                        throw new IllegalArgumentException("name must not be blank");
                }
                if (discountPercent == null) {
                        throw new IllegalArgumentException("discountPercent must not be null");
                }
                if (startAt == null) {
                        throw new IllegalArgumentException("startAt must not be null");
                }
                if (endAt == null) {
                        throw new IllegalArgumentException("endAt must not be null");
                }
                if (active == null) {
                        throw new IllegalArgumentException("active must not be null");
                }
                this.code = code;
                this.name = name;
                this.discountPercent = discountPercent;
                this.startAt = startAt;
                this.endAt = endAt;
                this.active = active;
                if (product != null) {
                        addProduct(product);
                }
        }

        public void addProduct(Product product) {
                if (product == null) {
                        throw new IllegalArgumentException("product must not be null");
                }
                if (!products.contains(product)) {
                        products.add(product);
                }
                if (!product.getPromotions().contains(this)) {
                        product.getPromotions().add(this);
                }
        }

        public void removeProduct(Product product) {
                if (product == null) {
                        return;
                }
                products.remove(product);
                product.getPromotions().remove(this);
        }

        public boolean isActiveNow() {
                LocalDateTime now = LocalDateTime.now();
                return Boolean.TRUE.equals(active)
                                && (now.isEqual(startAt) || now.isAfter(startAt))
                                && (now.isEqual(endAt) || now.isBefore(endAt));
        }

        public boolean canApplyTo(Product product) {
                return isActiveNow() && products.contains(product);
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

        /**
         * Generic active-flag change for callers (e.g. the "update promotion" form) that only
         * have a target boolean value in hand. Prefer {@link #activate()}/{@link #deactivate()}
         * when the intent is already known.
         */
        public void changeActive(Boolean active) {
                if (active == null) {
                        throw new IllegalArgumentException("active must not be null");
                }
                this.active = active;
        }
}
