package com.project.tech_gadget_store.entity;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "promotions", uniqueConstraints = @UniqueConstraint(name = "uk_promotions_code", columnNames = "code"))
@Getter
@Setter
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

        @ManyToMany
        @JoinTable(name = "promotion_products", joinColumns = @JoinColumn(name = "promotion_id"), inverseJoinColumns = @JoinColumn(name = "product_id"))
        private List<Product> products = new ArrayList<>();
}
