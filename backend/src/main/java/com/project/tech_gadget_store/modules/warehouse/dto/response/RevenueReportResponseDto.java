package com.project.tech_gadget_store.modules.warehouse.dto.response;

import com.project.tech_gadget_store.modules.catalog.dto.response.BrandRevenueDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.CategoryRevenueDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductSalesDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentMethodRevenueDto;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportResponseDto {
    private BigDecimal totalRevenue;
    private int totalOrders;
    private int totalQuantitySold;
    private String message;
    private List<RevenueTrendPointDto> trend;
    private List<CategoryRevenueDto> revenueByCategory;
    private List<BrandRevenueDto> revenueByBrand;
    private List<ProductSalesDto> topSellingProducts;
    private List<ProductSalesDto> topProfitProducts;
    private List<PaymentMethodRevenueDto> revenueByPaymentMethod;
    private Double cancellationRate;
}
