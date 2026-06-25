package com.project.tech_gadget_store.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportFilterRequestDto {
    private String period; // DAILY, WEEKLY, MONTHLY, CUSTOM
    private String startDate;
    private String endDate;
    private String categoryId;
    private String brandId;
    private String paymentMethod;
}
