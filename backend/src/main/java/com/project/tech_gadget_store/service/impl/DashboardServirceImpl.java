package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.entity.OrderItem;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.OrderItemRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.repository.ProductRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.service.BreakdownItem;
import com.project.tech_gadget_store.service.DashboardService;
import com.project.tech_gadget_store.service.LowStockItem;
import com.project.tech_gadget_store.service.TimeFrame;
import com.project.tech_gadget_store.service.TimeSeriesPoint;
import com.project.tech_gadget_store.service.TopCustomerItem;
import com.project.tech_gadget_store.service.TopProductItem;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class DashboardServirceImpl implements DashboardService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    @Override
    public Mono<BigDecimal> getTotalRevenue() {
        return orderRepository.findAllByOrderStatus("COMPLETED")
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public Mono<Long> getTotalOrdersByStatus(String orderStatus) {
        return orderRepository.findAllByOrderStatus(orderStatus)
                .count();
    }

    @Override
    public Flux<TimeSeriesPoint> getRevenueSeries(TimeFrame timeFrame) {
        return orderRepository.findAllByOrderStatus("COMPLETED")
                .filter(order -> order.getCreatedAt() != null)
                .groupBy(order -> toBucketLabel(order.getCreatedAt(), timeFrame))
                .flatMap(group -> group
                        .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .map(sum -> new TimeSeriesPoint(group.key(), sum)));
    }

    private String toBucketLabel(OffsetDateTime time, TimeFrame timeFrame) {
        return switch (timeFrame) {
            case DAILY -> time.toLocalDate().toString(); // 2026-05-13
            case WEEKLY -> time.getYear() + "-W" + time.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            case MONTHLY -> time.getYear() + "-" + String.format("%02d", time.getMonthValue());
            case YEARLY -> String.valueOf(time.getYear());
        };
    }

    @Override
    public Flux<TimeSeriesPoint> getOrderSeries(String orderStatus, TimeFrame timeFrame) {
        return orderRepository.findAllByOrderStatus(orderStatus)
                .filter(order -> order.getCreatedAt() != null)
                .groupBy(order -> toBucketLabel(order.getCreatedAt(), timeFrame))
                .flatMap(group -> group
                        .count()
                        .map(count -> new TimeSeriesPoint(group.key(), BigDecimal.valueOf(count))));
    }

    @Override
    public Flux<BreakdownItem> getOrderStatusBreakdown() {
        return orderRepository.findAll()
                .collectList()
                .flatMapMany(orders -> {
                    long totalOrders = orders.size();
                    if (totalOrders == 0) {
                        return Flux.empty();
                    }

                    return Flux.fromIterable(orders)
                            .groupBy(order -> order.getOrderStatus() == null ? "UNKNOWN" : order.getOrderStatus())
                            .flatMap(group -> group.collectList()
                                    .map(groupOrders -> {
                                        long count = groupOrders.size();
                                        BigDecimal amount = groupOrders.stream()
                                                .map(order -> order.getTotalAmount() == null
                                                        ? BigDecimal.ZERO
                                                        : order.getTotalAmount())
                                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                                        double percent = (count * 100.0) / totalOrders;
                                        return new BreakdownItem(group.key(), count, amount, percent);
                                    }));
                });
    }

    @Override
    public Flux<BreakdownItem> getPaymentMethodBreakdown() {
        return orderRepository.findAll()
                .groupBy(order -> order.getPaymentMethod() == null ? "UNKNOWN" : order.getPaymentMethod())
                .flatMap(group -> group.collectList()
                        .map(groupOrders -> {
                            long count = groupOrders.size();
                            BigDecimal amount = groupOrders.stream()
                                    .map(order -> order.getTotalAmount() == null
                                            ? BigDecimal.ZERO
                                            : order.getTotalAmount())
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                            return new BreakdownItem(group.key(), count, amount, 0.0);
                        }));

    }

    @Override
    public Flux<BreakdownItem> getPaymentStatusBreakdown() {
        return orderRepository.findAll()
                .groupBy(order -> order.getPaymentStatus() == null ? "UNKNOWN" : order.getPaymentStatus())
                .flatMap(group -> group.collectList()
                        .map(groupOrders -> {
                            long count = groupOrders.size();
                            BigDecimal amount = groupOrders.stream()
                                    .map(order -> order.getTotalAmount() == null
                                            ? BigDecimal.ZERO
                                            : order.getTotalAmount())
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                            return new BreakdownItem(group.key(), count, amount, 0.0);
                        }));
    }

    @Override
    public Flux<TopProductItem> getTopSellingProducts(int topN) {
        if (topN <= 0) {
            return Flux.empty();
        }

        return orderRepository.findAllByOrderStatus("COMPLETED")
                .flatMap(order -> orderItemRepository.findAllByOrderId(order.getId()))
                .groupBy(OrderItem::getVariantId)
                .flatMap(group -> group.collectList()
                        .flatMap(items -> {
                            long soldQuantity = items.stream()
                                    .mapToLong(item -> item.getQuantity() == null ? 0 : item.getQuantity())
                                    .sum();

                            BigDecimal revenue = items.stream()
                                    .map(item -> {
                                        BigDecimal unitPrice = item.getUnitPrice() == null ? BigDecimal.ZERO
                                                : item.getUnitPrice();
                                        int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
                                        return unitPrice.multiply(BigDecimal.valueOf(quantity));
                                    })
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                            return productVariantRepository.findById(group.key())
                                    .flatMap(variant -> productRepository.findById(variant.getProductId())
                                            .map(product -> new TopProductItem(
                                                    variant.getProductId(),
                                                    product.getName(),
                                                    variant.getId(),
                                                    variant.getVariantName(),
                                                    soldQuantity,
                                                    revenue)))
                                    .switchIfEmpty(Mono.just(new TopProductItem(
                                            null,
                                            "Unknown Product",
                                            group.key(),
                                            "Unknown Variant",
                                            soldQuantity,
                                            revenue)));
                        }))
                .sort((a, b) -> {
                    int byQuantity = b.soldQuantity().compareTo(a.soldQuantity());
                    return byQuantity != 0 ? byQuantity : b.revenue().compareTo(a.revenue());
                })
                .take(topN);
    }

    @Override
    public Flux<LowStockItem> getLowStockProducts(int threshold) {
        return productVariantRepository.findAll()
                .filter(variant -> variant.getStockQuantity() != null && variant.getStockQuantity() <= threshold)
                .flatMap(variant -> productRepository.findById(variant.getProductId())
                        .map(product -> new LowStockItem(
                                variant.getId(),
                                variant.getProductId(),
                                variant.getVariantName(),
                                variant.getStockQuantity(),
                                threshold)))
                .switchIfEmpty(Flux.empty());
    }

    @Override
    public Flux<TopCustomerItem> getTopCustomers(int topN) {
        if (topN <= 0) {
            return Flux.empty();
        }

        return orderRepository.findAllByOrderStatus("COMPLETED")
                .groupBy(order -> order.getAccountId())
                .flatMap(group -> group.collectList()
                        .flatMap(orders -> {
                            long totalOrders = orders.size();
                            BigDecimal totalSpent = orders.stream()
                                    .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO
                                            : order.getTotalAmount())
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                            if (group.key() == null) {
                                return Mono.just(new TopCustomerItem(
                                        null,
                                        "Unknown Customer",
                                        totalOrders,
                                        totalSpent));
                            }

                            return customerRepository.findByAccountId(group.key())
                                    .map(customer -> new TopCustomerItem(
                                            customer.getId(),
                                            customer.getFullName() == null || customer.getFullName().isBlank()
                                                    ? "Unknown Customer"
                                                    : customer.getFullName(),
                                            totalOrders,
                                            totalSpent))
                                    .switchIfEmpty(accountRepository.findById(group.key())
                                            .map(account -> new TopCustomerItem(
                                                    group.key(),
                                                    account.getFullName() == null || account.getFullName().isBlank()
                                                            ? account.getEmail()
                                                            : account.getFullName(),
                                                    totalOrders,
                                                    totalSpent))
                                            .defaultIfEmpty(new TopCustomerItem(
                                                    group.key(),
                                                    "Unknown Customer",
                                                    totalOrders,
                                                    totalSpent)));
                        }))
                .sort((a, b) -> {
                    int bySpent = b.totalSpent().compareTo(a.totalSpent());
                    return bySpent != 0 ? bySpent : b.totalOrders().compareTo(a.totalOrders());
                })
                .take(topN);
    }

    @Override
    public Flux<TimeSeriesPoint> getNewCustomersSeries(TimeFrame timeFrame) {
        return accountRepository.findAll()
                .filter(account -> account.getCreatedAt() != null)
                .filter(account -> account.getRole() != null
                        && ("USER".equals(account.getRole().name()) || "CUSTOMER".equals(account.getRole().name())))
                .groupBy(account -> toBucketLabel(account.getCreatedAt(), timeFrame))
                .flatMap(group -> group.count()
                        .map(count -> new TimeSeriesPoint(group.key(), BigDecimal.valueOf(count))));
    }

}
