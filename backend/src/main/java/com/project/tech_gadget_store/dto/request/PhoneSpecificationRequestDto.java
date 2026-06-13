package com.project.tech_gadget_store.dto.request;

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
public class PhoneSpecificationRequestDto {

    @NotBlank(message = "productId must not be blank")
    private String productId;
    private Double screenSize;
    @NotBlank(message = "rearCamera must not be blank")
    private String rearCamera;
    @NotBlank(message = "frontCamera must not be blank")
    private String frontCamera;
    @NotBlank(message = "chipset must not be blank")
    private String chipset;
    @NotNull(message = "nfcSupported must not be null")
    private Boolean nfcSupported;
    @NotNull(message = "batteryCapacity must not be null")
    @Positive(message = "batteryCapacity must be positive")
    private Integer batteryCapacity;
    @NotBlank(message = "simType must not be blank")
    private String simType;
    @NotBlank(message = "operatingSystem must not be blank")
    private String operatingSystem;
    @NotBlank(message = "screenResolution must not be blank")
    private String screenResolution;
}
