package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.CODPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CODPaymentMethodRepository extends JpaRepository<CODPaymentMethod, String> {
    Optional<CODPaymentMethod> findFirstByOrderByCreatedAtAsc();
}
