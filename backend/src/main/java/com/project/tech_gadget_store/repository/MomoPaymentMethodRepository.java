package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.MomoPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MomoPaymentMethodRepository extends JpaRepository<MomoPaymentMethod, String> {

    Optional<MomoPaymentMethod> findFirstByOrderByCreatedAtAsc();
}
