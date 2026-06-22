package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.PaymentLog;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PaymentLogRepository extends JpaRepository<PaymentLog, String> {

    @Query("SELECT p FROM PaymentLog p WHERE p.order.id = :orderId ORDER BY p.createdAt DESC")
    List<PaymentLog> findByOrderIdOrderByCreatedAtDesc(String orderId);

    Optional<PaymentLog> findByTransactionId(String transactionId);

    @Query("SELECT p FROM PaymentLog p WHERE p.order.id = :orderId AND p.status = :status ORDER BY p.createdAt DESC")
    Optional<PaymentLog> findFirstByOrderIdAndStatus(String orderId, PaymentLogStatus status);
}
