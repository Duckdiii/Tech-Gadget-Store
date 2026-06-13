package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.project.tech_gadget_store.entity.enums.BundleServiceType;
import java.math.BigDecimal;
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
public class BundleServiceRequestDto {

    @NotBlank(message = "name must not be blank")
    private String name;
    @NotNull(message = "type must not be null")
    private BundleServiceType type;
    private String description;
    @NotNull(message = "price must not be null")
    @DecimalMin(value = "0.00", message = "price must not be negative")
    private BigDecimal price;
    @Min(value = 0, message = "durationMonths must not be negative")
    private Integer durationMonths;
    @NotNull(message = "active must not be null")
    private Boolean active;
}
