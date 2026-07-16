package com.project.tech_gadget_store.modules.catalog.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequestDto {

    private String keyword;
    private List<String> brandNames;
    private List<String> categoryNames;

    @DecimalMin(value = "0.0", message = "minPrice must not be negative")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", message = "maxPrice must not be negative")
    private BigDecimal maxPrice;

    @AssertTrue(message = "minPrice must not be greater than maxPrice")
    private boolean isPriceRangeValid() {
        return minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) <= 0;
    }

    private List<Integer> ramGb;
    private List<Integer> storageGb;
    private List<String> colors;

    private String operatingSystem;
    private Double minScreenSize;
    private Double maxScreenSize;
    private Integer minBatteryCapacity;
    private Integer maxBatteryCapacity;
    private String chipset;
    private Boolean nfcSupported;
    private String simType;

    private Boolean onlyAvailable;
    private Boolean onPromotion;

    // --- Laptop-specific ---
    private String cpuKeyword;       // substring search on Laptop.cpu
    private String gpuKeyword;       // substring search on Laptop.gpu
    private Double minWeight;        // kg, Laptop.weight
    private Double maxWeight;

    // --- Monitor-specific ---
    private Integer minRefreshRate;  // Hz, Monitor.refreshRate
    private Integer maxRefreshRate;
    private String panelType;        // Monitor.panelType (IPS, VA, OLED, ...)

    // --- Headphones-specific ---
    private Boolean isWireless;      // Headphones.isWireless
    private Boolean hasNoiseCancelling; // Headphones.hasNoiseCancelling

    // --- Smartwatch-specific ---
    private Boolean hasGps;          // Smartwatch.hasGps
    private Boolean isWaterResistant; // Smartwatch.isWaterResistant

    private String sort;

    @Min(value = 0, message = "page must not be negative")
    private Integer page;

    @Min(value = 1, message = "size must be at least 1")
    @Max(value = 100, message = "size must not exceed 100")
    private Integer size;
}
