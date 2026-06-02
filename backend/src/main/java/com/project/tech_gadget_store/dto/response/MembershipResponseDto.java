package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.MembershipTier;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private MembershipTier tier;
    private String benefitId;
    private BigDecimal minSpending;
    private BigDecimal maxSpending;
    private List<String> customersIds;
}
