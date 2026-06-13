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
    @NotBlank(message = "benefitId must not be blank")
    private String benefitId;
    @NotNull(message = "minSpending must not be null")
    @DecimalMin(value = "0.00", message = "minSpending must not be negative")
    private BigDecimal minSpending;
    @NotNull(message = "maxSpending must not be null")
    @DecimalMin(value = "0.00", message = "maxSpending must not be negative")
    private BigDecimal maxSpending;
}
