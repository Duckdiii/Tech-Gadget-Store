package com.project.tech_gadget_store.modules.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "headphones")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Headphones extends Product {

    @Column(name = "connector_type", length = 80)
    private String connectorType;

    @Column(name = "is_wireless")
    private Boolean isWireless;

    @Column(name = "battery_life_hours")
    private Integer batteryLifeHours;

    @Column(name = "has_noise_cancelling")
    private Boolean hasNoiseCancelling;

    public Headphones(String name, String description, Brand brand, Category category) {
        super(name, description, brand, category);
    }

    @Override
    public ProductSpecs specs() {
        return ProductSpecs.builder()
                .connectorType(connectorType)
                .isWireless(isWireless)
                .batteryLifeHours(batteryLifeHours)
                .hasNoiseCancelling(hasNoiseCancelling)
                .build();
    }

    @Override
    public List<String> buildSpecSummaryParts(List<ProductVariant> variants) {
        List<String> parts = new ArrayList<>();
        parts.add(Boolean.TRUE.equals(isWireless) ? "Không dây" : "Có dây");
        if (Boolean.TRUE.equals(hasNoiseCancelling)) {
            parts.add("Chống ồn ANC");
        }
        if (batteryLifeHours != null) {
            parts.add(batteryLifeHours + "h pin");
        }
        return parts;
    }
}
