package com.project.tech_gadget_store.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerStatsResponseDto {
    private long newCustomers;
    private long totalCustomers;
}
