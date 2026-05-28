package com.project.tech_gadget_store.service.dashboard;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.service.TimeFrame;
import com.project.tech_gadget_store.service.TimeSeriesPoint;
import com.project.tech_gadget_store.service.TopCustomerItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CustomerDashboardQueryService {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    public Flux<TopCustomerItem> getTopCustomers(int topN) {
        if (topN <= 0) {
            return Flux.empty();
        }

        return orderRepository.findAllByOrderStatus(OrderStatus.COMPLETED.name())
                .groupBy(order -> order.getAccountId())
                .flatMap(group -> group.collectList().flatMap(orders -> {
                    long totalOrders = orders.size();
                    BigDecimal totalSpent = orders.stream()
                            .map(order -> order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount())
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

    public Flux<TimeSeriesPoint> getNewCustomersSeries(TimeFrame timeFrame) {
        Objects.requireNonNull(timeFrame, "timeFrame must not be null");
        return accountRepository.findAll()
                .filter(account -> account.getCreatedAt() != null)
                .filter(account -> account.getRole() != null
                        && ("USER".equals(account.getRole().name()) || "CUSTOMER".equals(account.getRole().name())))
                .groupBy(account -> toBucketLabel(account.getCreatedAt(), timeFrame))
                .flatMap(group -> group.count()
                        .map(count -> new TimeSeriesPoint(group.key(), BigDecimal.valueOf(count))));
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
