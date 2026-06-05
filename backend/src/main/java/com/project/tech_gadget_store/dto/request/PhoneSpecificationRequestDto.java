package com.project.tech_gadget_store.dto.request;

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

    private String productId;
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
