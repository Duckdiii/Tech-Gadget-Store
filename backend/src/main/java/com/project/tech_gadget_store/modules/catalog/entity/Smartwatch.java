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
@Table(name = "smartwatches")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Smartwatch extends Product {

    @Column(name = "battery_life_days")
    private Integer batteryLifeDays;

    @Column(name = "is_water_resistant")
    private Boolean isWaterResistant;

    @Column(name = "has_gps")
    private Boolean hasGps;

    public Smartwatch(String name, String description, Brand brand, Category category) {
        super(name, description, brand, category);
    }

    @Override
    public ProductSpecs specs() {
        return ProductSpecs.builder()
                .batteryLifeDays(batteryLifeDays)
                .isWaterResistant(isWaterResistant)
                .hasGps(hasGps)
                .build();
    }

    @Override
    public List<String> buildSpecSummaryParts(List<ProductVariant> variants) {
        List<String> parts = new ArrayList<>();
        if (Boolean.TRUE.equals(hasGps)) {
            parts.add("GPS");
        }
        if (Boolean.TRUE.equals(isWaterResistant)) {
            parts.add("Chống nước");
        }
        if (batteryLifeDays != null) {
            parts.add(batteryLifeDays + " ngày pin");
        }
        return parts;
    }
}
