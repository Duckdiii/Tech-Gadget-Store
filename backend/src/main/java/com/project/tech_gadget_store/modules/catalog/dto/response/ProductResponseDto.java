package com.project.tech_gadget_store.modules.catalog.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Getter
@Builder // lombok
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {

    private String id;
    /** The default (first/cheapest) variant's id — favorite/subscribe act on a variant, so card-level UI needs this to call them. */
    private String variantId;
    private String name;
    private String brandName;
    private String categoryName;
    private BigDecimal minPrice;
    private String imageUrl;
    private Integer ramGb;
    private Integer storageGb;
    private String color;
    private boolean hasVariants;
    private Double discountPercent;
    private Integer salesCount;
    private String specSummary;
    private Double averageRating;
    private Integer reviewCount;
    /** Tổng số serial vật lí có trạng thái IN_STOCK của sản phẩm này. */
    private long availableCount;

    // Spec details for List view
    private String cpu;
    private String gpu;
    private Double screenSize;
    private Integer batteryCapacity;
    private String operatingSystem;
    private String chipset;
    private String resolution;
    private Integer refreshRate;
    private String panelType;
    private Boolean isWireless;
    private Boolean hasNoiseCancelling;
    private Integer batteryLifeHours;
    private Integer batteryLifeDays;
    private Boolean hasGps;
    private Boolean isWaterResistant;
}
