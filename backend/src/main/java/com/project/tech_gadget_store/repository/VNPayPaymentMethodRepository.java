package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.VNPayPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VNPayPaymentMethodRepository extends JpaRepository<VNPayPaymentMethod, String> {

    Optional<VNPayPaymentMethod> findFirstByOrderByCreatedAtAsc();
}
