package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.BundleServiceType;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Entity
@Table(name = "bundle_services")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BundleService extends BaseEntity {

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private BundleServiceType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_months")
    private Integer durationMonths;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @ManyToMany(mappedBy = "bundleServices")
    private List<CartItem> cartItems = new ArrayList<>();

    @ManyToMany(mappedBy = "bundleServices")
    private List<OrderItem> orderItems = new ArrayList<>();

    public BundleService(String name, BundleServiceType type, BigDecimal price, Integer durationMonths) {
        this.name = name;
        this.type = type;
        this.price = price;
        this.durationMonths = durationMonths;
    }
}
