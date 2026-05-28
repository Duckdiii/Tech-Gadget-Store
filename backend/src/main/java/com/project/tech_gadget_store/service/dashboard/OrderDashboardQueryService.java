package com.project.tech_gadget_store.service.dashboard;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.service.BreakdownItem;
import com.project.tech_gadget_store.service.TimeFrame;
import com.project.tech_gadget_store.service.TimeSeriesPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderDashboardQueryService {
    private final OrderRepository orderRepository;

    public Mono<BigDecimal> getTotalRevenue() {
        return orderRepository.findAllByOrderStatus(OrderStatus.COMPLETED.name())
                .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Mono<Long> getTotalOrdersByStatus(OrderStatus orderStatus) {
        Objects.requireNonNull(orderStatus, "orderStatus must not be null");
        return orderRepository.findAllByOrderStatus(orderStatus.name())
                .count();
    }

    public Flux<TimeSeriesPoint> getRevenueSeries(TimeFrame timeFrame) {
        Objects.requireNonNull(timeFrame, "timeFrame must not be null");
        return orderRepository.findAllByOrderStatus(OrderStatus.COMPLETED.name())
                .filter(order -> order.getCreatedAt() != null)
                .groupBy(order -> toBucketLabel(order.getCreatedAt(), timeFrame))
                .flatMap(group -> group
                        .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .map(sum -> new TimeSeriesPoint(group.key(), sum)));
    }

    public Flux<TimeSeriesPoint> getOrderSeries(OrderStatus orderStatus, TimeFrame timeFrame) {
        Objects.requireNonNull(orderStatus, "orderStatus must not be null");
        Objects.requireNonNull(timeFrame, "timeFrame must not be null");
        return orderRepository.findAllByOrderStatus(orderStatus.name())
                .filter(order -> order.getCreatedAt() != null)
                .groupBy(order -> toBucketLabel(order.getCreatedAt(), timeFrame))
                .flatMap(group -> group.count()
                        .map(count -> new TimeSeriesPoint(group.key(), BigDecimal.valueOf(count))));
    }

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
                            .flatMap(group -> group.collectList().map(groupOrders -> {
                                long count = groupOrders.size();
                                BigDecimal amount = groupOrders.stream()
                                        .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount())
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                double percent = (count * 100.0) / totalOrders;
                                return new BreakdownItem(group.key(), count, amount, percent);
                            }));
                });
    }

    public Flux<BreakdownItem> getPaymentMethodBreakdown() {
        return orderRepository.findAll()
                .groupBy(order -> order.getPaymentMethod() == null ? "UNKNOWN" : order.getPaymentMethod())
                .flatMap(group -> group.collectList().map(groupOrders -> {
                    long count = groupOrders.size();
                    BigDecimal amount = groupOrders.stream()
                            .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new BreakdownItem(group.key(), count, amount, 0.0);
                }));
    }

    public Flux<BreakdownItem> getPaymentStatusBreakdown() {
        return orderRepository.findAll()
                .groupBy(order -> order.getPaymentStatus() == null ? "UNKNOWN" : order.getPaymentStatus())
                .flatMap(group -> group.collectList().map(groupOrders -> {
                    long count = groupOrders.size();
                    BigDecimal amount = groupOrders.stream()
                            .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new BreakdownItem(group.key(), count, amount, 0.0);
                }));
    }

    private String toBucketLabel(OffsetDateTime time, TimeFrame timeFrame) {
        return switch (timeFrame) {
            case DAILY -> time.toLocalDate().toString();
            case WEEKLY -> time.getYear() + "-W" + time.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            case MONTHLY -> time.getYear() + "-" + String.format("%02d", time.getMonthValue());
            case YEARLY -> String.valueOf(time.getYear());
        };
    }
}
