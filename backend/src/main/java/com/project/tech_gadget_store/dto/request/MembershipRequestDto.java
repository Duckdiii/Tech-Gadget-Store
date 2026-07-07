package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.project.tech_gadget_store.entity.enums.MembershipTier;
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
public class MembershipRequestDto {

    @NotNull(message = "tier must not be null")
    private MembershipTier tier;
    @NotNull(message = "benefit must not be null")
    @Valid
    private MembershipBenefitRequestDto benefit;
    @DecimalMin(value = "0.00", message = "minSpending must not be negative")
    private BigDecimal minSpending;
    @DecimalMin(value = "0.00", message = "maxSpending must not be negative")
    private BigDecimal maxSpending;
}
