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

    @Query("SELECT p FROM PaymentLog p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:start IS NULL OR p.createdAt >= :start) AND " +
           "(:end IS NULL OR p.createdAt <= :end) " +
           "ORDER BY p.createdAt DESC")
    Page<PaymentLog> findFilteredPaymentLogs(
            @Param("status") PaymentLogStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    @Query("SELECT p FROM PaymentLog p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:start IS NULL OR p.createdAt >= :start) AND " +
           "(:end IS NULL OR p.createdAt <= :end) AND " +
           "(:cursorTimestamp IS NULL OR p.createdAt < :cursorTimestamp OR " +
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
