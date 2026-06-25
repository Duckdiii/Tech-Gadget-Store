package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportResponseDto {
    private BigDecimal totalRevenue;
    private int totalOrders;
    private String message;
    private List<RevenueTrendPointDto> trend;
    private List<CategoryRevenueDto> revenueByCategory;
    private List<BrandRevenueDto> revenueByBrand;
    private List<ProductSalesDto> topSellingProducts;
    private List<PaymentMethodRevenueDto> revenueByPaymentMethod;
}
