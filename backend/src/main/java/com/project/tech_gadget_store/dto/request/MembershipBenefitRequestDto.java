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
public class MembershipBenefitRequestDto {

    @NotNull(message = "discountPercentage must not be null")
    @DecimalMin(value = "0.0", message = "discountPercentage must not be negative")
    @DecimalMax(value = "100.0", message = "discountPercentage must not exceed 100")
    private Double discountPercentage;
    @NotNull(message = "freeShipping must not be null")
    private Boolean freeShipping;
    private String description;
}
