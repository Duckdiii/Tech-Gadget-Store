package com.project.tech_gadget_store.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerListStatsDto {
    private long totalCustomers;
    private long newThisMonth;
    private long vipCustomers;
    private double retentionRate;
}
