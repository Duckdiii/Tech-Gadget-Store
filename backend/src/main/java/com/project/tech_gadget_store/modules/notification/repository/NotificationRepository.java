package com.project.tech_gadget_store.modules.notification.repository;

import com.project.tech_gadget_store.modules.notification.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Notification> findByCustomerIdAndReadAtIsNull(String customerId);

    Optional<Notification> findByIdAndCustomerId(String id, String customerId);
}
