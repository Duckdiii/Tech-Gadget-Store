package com.project.tech_gadget_store.modules.loyalty.dto.response;

import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipTierResponseDto {

    private MembershipTier tier;
    private BigDecimal minSpending;
    private BigDecimal maxSpending;
    private Double discountPercentage;
    private Boolean freeShipping;
    private String description;
}
