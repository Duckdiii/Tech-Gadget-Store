package com.project.tech_gadget_store.modules.payment.repository;

import com.project.tech_gadget_store.modules.payment.entity.CODPaymentMethod;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CODPaymentMethodRepository extends JpaRepository<CODPaymentMethod, String> {
    Optional<CODPaymentMethod> findFirstByOrderByCreatedAtAsc();
}
