package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.service.BreakdownItem;
import com.project.tech_gadget_store.service.DashboardService;
import com.project.tech_gadget_store.service.LowStockItem;
import com.project.tech_gadget_store.service.TimeFrame;
import com.project.tech_gadget_store.service.TimeSeriesPoint;
import com.project.tech_gadget_store.service.TopCustomerItem;
import com.project.tech_gadget_store.service.TopProductItem;
import com.project.tech_gadget_store.service.dashboard.CustomerDashboardQueryService;
import com.project.tech_gadget_store.service.dashboard.OrderDashboardQueryService;
import com.project.tech_gadget_store.service.dashboard.ProductDashboardQueryService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class DashboardServirceImpl implements DashboardService {
        private final OrderDashboardQueryService orderDashboardQueryService;
        private final ProductDashboardQueryService productDashboardQueryService;
        private final CustomerDashboardQueryService customerDashboardQueryService;

        @Override
        public Mono<BigDecimal> getTotalRevenue() {
                return orderDashboardQueryService.getTotalRevenue();
        }

        @Override
        public Mono<Long> getTotalOrdersByStatus(OrderStatus orderStatus) {
                return orderDashboardQueryService.getTotalOrdersByStatus(orderStatus);
        }

        @Override
        public Flux<TimeSeriesPoint> getRevenueSeries(TimeFrame timeFrame) {
                return orderDashboardQueryService.getRevenueSeries(timeFrame);
        }

        @Override
        public Flux<TimeSeriesPoint> getOrderSeries(OrderStatus orderStatus, TimeFrame timeFrame) {
                return orderDashboardQueryService.getOrderSeries(orderStatus, timeFrame);
        }

        @Override
        public Flux<BreakdownItem> getOrderStatusBreakdown() {
                return orderDashboardQueryService.getOrderStatusBreakdown();
        }

        @Override
        public Flux<BreakdownItem> getPaymentMethodBreakdown() {
                return orderDashboardQueryService.getPaymentMethodBreakdown();
        }

        @Override
        public Flux<BreakdownItem> getPaymentStatusBreakdown() {
                return orderDashboardQueryService.getPaymentStatusBreakdown();
        }

        @Override
        public Flux<TopProductItem> getTopSellingProducts(int topN) {
                return productDashboardQueryService.getTopSellingProducts(topN);
        }

        @Override
        public Flux<LowStockItem> getLowStockProducts(int threshold) {
                return productDashboardQueryService.getLowStockProducts(threshold);
        }

        @Override
        public Flux<TopCustomerItem> getTopCustomers(int topN) {
                return customerDashboardQueryService.getTopCustomers(topN);
        }

        @Override
        public Flux<TimeSeriesPoint> getNewCustomersSeries(TimeFrame timeFrame) {
                return customerDashboardQueryService.getNewCustomersSeries(timeFrame);
        }

}
