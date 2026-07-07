package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Notification> findByCustomerIdAndReadAtIsNull(String customerId);

    Optional<Notification> findByIdAndCustomerId(String id, String customerId);
}
