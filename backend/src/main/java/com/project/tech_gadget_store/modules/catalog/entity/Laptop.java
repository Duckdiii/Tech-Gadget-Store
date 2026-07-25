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
@Table(name = "laptops")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Laptop extends Product {

    @Column(name = "cpu", length = 120)
    private String cpu;

    @Column(name = "gpu", length = 120)
    private String gpu;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "screen_size")
    private Double screenSize;

    @Column(name = "operating_system", length = 120)
    private String operatingSystem;

    public Laptop(String name, String description, Brand brand, Category category) {
        super(name, description, brand, category);
    }

    @Override
    public ProductSpecs specs() {
        return ProductSpecs.builder()
                .screenSize(screenSize)
                .operatingSystem(operatingSystem)
                .cpu(cpu)
                .gpu(gpu)
                .weight(weight)
                .build();
    }

    @Override
    public void applySpecs(ProductSpecs specs) {
        this.screenSize = specs.getScreenSize();
        this.operatingSystem = specs.getOperatingSystem();
        // cpu/gpu/weight can be set here if present in DTO/future extensions
    }

    @Override
    public List<String> buildSpecSummaryParts(List<ProductVariant> variants) {
        List<String> parts = new ArrayList<>();
        if (cpu != null) {
            parts.add(cpu);
        }
        appendRamAndStorage(parts, variants);
        return parts;
    }

    @Override
    public double shippingWeightKg() {
        return weight != null ? weight : super.shippingWeightKg();
    }
}
