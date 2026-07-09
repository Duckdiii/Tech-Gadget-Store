package com.project.tech_gadget_store.modules.payment.repository;

import com.project.tech_gadget_store.modules.payment.entity.VNPayPaymentMethod;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;



public interface VNPayPaymentMethodRepository extends JpaRepository<VNPayPaymentMethod, String> {

    Optional<VNPayPaymentMethod> findFirstByOrderByCreatedAtAsc();
}
