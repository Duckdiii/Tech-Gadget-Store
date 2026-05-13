package com.project.tech_gadget_store.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DashboardService {
    Mono<BigDecimal> getTotalRevenue();

    Mono<Long> getTotalOrdersByStatus(String orderStatus);

    Flux<TimeSeriesPoint> getRevenueSeries(TimeFrame timeFrame);

    Flux<TimeSeriesPoint> getOrderSeries(String orderStatus, TimeFrame timeFrame);

    Flux<BreakdownItem> getOrderStatusBreakdown();

    Flux<BreakdownItem> getPaymentMethodBreakdown();

    Flux<BreakdownItem> getPaymentStatusBreakdown();

    Flux<TopProductItem> getTopSellingProducts(int topN);

    Flux<LowStockItem> getLowStockProducts(int threshold);

    Flux<TopCustomerItem> getTopCustomers(int topN);

    Flux<TimeSeriesPoint> getNewCustomersSeries(TimeFrame timeFrame);

}
