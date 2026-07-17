package com.project.tech_gadget_store.modules.payment.repository;

import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.entity.enums.PaymentLogStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface PaymentLogRepository extends JpaRepository<PaymentLog, String> {

    @Query("SELECT p FROM PaymentLog p WHERE p.order.id = :orderId ORDER BY p.createdAt DESC")
    List<PaymentLog> findByOrderIdOrderByCreatedAtDesc(String orderId);

    @Query("SELECT p FROM PaymentLog p WHERE p.order.id = :orderId AND p.status = :status ORDER BY p.createdAt DESC")
    Optional<PaymentLog> findFirstByOrderIdAndStatus(String orderId, PaymentLogStatus status);

    // start/end/cursorTimestamp must be cast to timestamp — with a bare "cast(:start as
    // timestamp)"-less null parameter, Postgres can't infer its type and fails with
    // "could not determine data type of parameter $n" (same issue already fixed in
    // OrderRepository.findOrdersCursor and CustomerRepository.searchCustomers).
    @Query("SELECT p FROM PaymentLog p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(cast(:start as timestamp) IS NULL OR p.createdAt >= :start) AND " +
           "(cast(:end as timestamp) IS NULL OR p.createdAt <= :end) " +
           "ORDER BY p.createdAt DESC")
    Page<PaymentLog> findFilteredPaymentLogs(
            @Param("status") PaymentLogStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    @Query("SELECT p FROM PaymentLog p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(cast(:start as timestamp) IS NULL OR p.createdAt >= :start) AND " +
           "(cast(:end as timestamp) IS NULL OR p.createdAt <= :end) AND " +
           "(cast(:cursorTimestamp as timestamp) IS NULL OR p.createdAt < :cursorTimestamp OR " +
           "(p.createdAt = :cursorTimestamp AND p.id < :cursorId)) " +
           "ORDER BY p.createdAt DESC, p.id DESC")
    List<PaymentLog> findPaymentLogsCursor(
            @Param("status") PaymentLogStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
