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
@Table(name = "monitors")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Monitor extends Product {

    @Column(name = "screen_size")
    private Double screenSize;

    @Column(name = "resolution", length = 80)
    private String resolution;

    @Column(name = "refresh_rate")
    private Integer refreshRate;

    @Column(name = "panel_type", length = 80)
    private String panelType;

    public Monitor(String name, String description, Brand brand, Category category) {
        super(name, description, brand, category);
    }

    @Override
    public ProductSpecs specs() {
        return ProductSpecs.builder()
                .screenSize(screenSize)
                .screenResolution(resolution)
                .refreshRate(refreshRate)
                .panelType(panelType)
                .build();
    }

    @Override
    public void applySpecs(ProductSpecs specs) {
        this.screenSize = specs.getScreenSize();
        this.resolution = specs.getScreenResolution();
    }

    @Override
    public List<String> buildSpecSummaryParts(List<ProductVariant> variants) {
        List<String> parts = new ArrayList<>();
        if (screenSize != null) {
            parts.add(screenSize.intValue() + "\"");
        }
        if (resolution != null) {
            parts.add(resolution);
        }
        if (refreshRate != null) {
            parts.add(refreshRate + "Hz");
        }
        if (panelType != null) {
            parts.add(panelType);
        }
        return parts;
    }
}
