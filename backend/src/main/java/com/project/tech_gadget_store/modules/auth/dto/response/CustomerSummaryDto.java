package com.project.tech_gadget_store.modules.auth.dto.response;

import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDto {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private MembershipTier tier;
    private long totalOrders;
    private BigDecimal totalSpend;
    private LocalDateTime joinDate;
    private String accountId;
    private String accountStatus;
}
