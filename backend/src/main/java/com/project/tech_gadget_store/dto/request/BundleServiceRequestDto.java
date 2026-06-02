package com.project.tech_gadget_store.dto.request;

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

    private String name;
    private BundleServiceType type;
    private String description;
    private BigDecimal price;
    private Integer durationMonths;
    private Boolean active;
}
