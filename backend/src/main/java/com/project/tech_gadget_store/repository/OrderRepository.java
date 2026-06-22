package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, String> {

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId ORDER BY o.orderDate DESC")
    Page<Order> findRecentOrdersByCustomerId(String customerId, Pageable pageable);

    Page<Order> findOrdersByCustomerId(String customerId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
            "AND o.orderDate >= :from AND o.orderDate <= :to " +
            "ORDER BY o.orderDate DESC")
    Page<Order> findByCustomerIdAndDateRange(String customerId, LocalDateTime from, LocalDateTime to,
            Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
            "AND YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month AND DAY(o.orderDate) = :day " +
            "ORDER BY o.orderDate DESC")
    Page<Order> findByCustomerIdAndDay(String customerId, int year, int month, int day, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
            "AND YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month " +
            "ORDER BY o.orderDate DESC")
    Page<Order> findByCustomerIdAndMonth(String customerId, int year, int month, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
            "AND YEAR(o.orderDate) = :year " +
            "ORDER BY o.orderDate DESC")
    Page<Order> findByCustomerIdAndYear(String customerId, int year, Pageable pageable);

    Page<Order> findOrdersByCustomerIdAndOrderStatus(String customerId, String status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(i.unitPriceAtOrder * i.quantity), 0) " +
            "FROM Order o JOIN o.items i " +
            "WHERE o.customer.id = :customerId AND o.orderStatus = :status")
    BigDecimal sumSpentByCustomerIdAndStatus(String customerId, OrderStatus status);

    @Query("SELECT COALESCE(SUM(i.unitPriceAtOrder * i.quantity), 0) " +
            "FROM Order o JOIN o.items i " +
            "WHERE o.customer.id = :customerId AND o.orderStatus = :status " +
            "AND o.orderDate >= :from AND o.orderDate <= :to")
    BigDecimal sumSpentByCustomerIdAndStatusAndDateRange(String customerId, OrderStatus status,
            LocalDateTime from, LocalDateTime to);

}
