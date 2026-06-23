package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponseDto {

    private String id;
    private String name;
    private String description;

    private String brandName;
    private String brandLogoUrl;
    private String categoryName;

    private BigDecimal minPrice;
    private boolean hasVariants;

    private List<String> imageUrls;
    private List<ProductVariantResponseDto> variants;
    private List<BundleServiceResponseDto> bundleServices;

    private Double screenSize;
    private String screenResolution;
    private String rearCamera;
    private String frontCamera;
    private String chipset;
    private Boolean nfcSupported;
    private Integer batteryCapacity;
    private String simType;
    private String operatingSystem;
}
