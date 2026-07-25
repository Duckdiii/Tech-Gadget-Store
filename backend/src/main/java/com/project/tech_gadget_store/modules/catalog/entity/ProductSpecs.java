package com.project.tech_gadget_store.modules.catalog.entity;

import lombok.Builder;
import lombok.Getter;

/**
 * Type-specific spec fields (screen size, CPU, battery...), normalized across every
 * {@link Product} subtype into one shape. Used both ways: {@link Product#specs()} reads them out
 * (for {@code ProductMapper}), {@link Product#applySpecs(ProductSpecs)} writes them in (for
 * {@code ProductManagementService}) — so callers never need to know which concrete subtype they're
 * holding, and don't need a dependency on any DTO to pass fields in.
 *
 * <p>Not every field applies to every product type; a subtype simply leaves the fields it doesn't
 * have as {@code null}.
 */
@Getter
@Builder
public class ProductSpecs {

    public static final ProductSpecs EMPTY = ProductSpecs.builder().build();

    private final Double screenSize;
    private final String screenResolution;
    private final String rearCamera;
    private final String frontCamera;
    private final String chipset;
    private final Boolean nfcSupported;
    private final Integer batteryCapacity;
    private final String simType;
    private final String operatingSystem;
    private final String cpu;
    private final String gpu;
    private final Double weight;
    private final Integer refreshRate;
    private final String panelType;
    private final String connectorType;
    private final Boolean isWireless;
    private final Integer batteryLifeHours;
    private final Boolean hasNoiseCancelling;
    private final Integer batteryLifeDays;
    private final Boolean isWaterResistant;
    private final Boolean hasGps;
}
