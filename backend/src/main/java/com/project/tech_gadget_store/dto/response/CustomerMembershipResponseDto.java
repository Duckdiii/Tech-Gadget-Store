package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.MembershipTier;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerMembershipResponseDto {

    private MembershipTier tier;
    private BigDecimal minSpending;
    private BigDecimal maxSpending;
    private Double discountPercentage;
    private Boolean freeShipping;
    private String description;
    private BigDecimal totalSpent;
    private MembershipTier nextTier;
    private BigDecimal nextTierMinSpending;
    private BigDecimal amountToNextTier;
}
