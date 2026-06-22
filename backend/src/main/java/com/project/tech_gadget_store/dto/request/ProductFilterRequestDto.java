package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequestDto {

    private String keyword;
    private List<String> brandNames;

    @DecimalMin(value = "0.0", message = "minPrice must not be negative")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", message = "maxPrice must not be negative")
    private BigDecimal maxPrice;

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

    private String sort;

    @Min(value = 0, message = "page must not be negative")
    private Integer page;

    @Min(value = 1, message = "size must be at least 1")
    private Integer size;
}
