package com.project.tech_gadget_store.modules.catalog.dto.response;

import com.project.tech_gadget_store.modules.loyalty.dto.response.BundleServiceResponseDto;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponseDto {

    private String id;
    private String name;
    private String description;

    private String brandId;
    private String brandName;
    private String brandLogoUrl;
    private String categoryId;
    private String categoryName;

    private BigDecimal minPrice;
    private boolean hasVariants;
    private Boolean isActive;

    private List<String> imageUrls;
    private List<ProductImageResponseDto> images;
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
