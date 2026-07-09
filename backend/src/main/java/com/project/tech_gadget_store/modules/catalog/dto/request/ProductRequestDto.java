package com.project.tech_gadget_store.modules.catalog.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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
public class ProductRequestDto {

    @NotBlank(message = "name must not be blank")
    private String name;
    private String description;
    @NotBlank(message = "brandId must not be blank")
    private String brandId;
    @NotBlank(message = "categoryId must not be blank")
    private String categoryId;

    private Double screenSize;
    private String rearCamera;
    private String frontCamera;
    private String chipset;
    private Boolean nfcSupported;
    private Integer batteryCapacity;
    private String simType;
    private String operatingSystem;
    private String screenResolution;
}
