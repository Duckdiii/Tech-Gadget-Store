package com.project.tech_gadget_store.modules.payment.repository;

import com.project.tech_gadget_store.modules.payment.entity.MomoPaymentMethod;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;



public interface MomoPaymentMethodRepository extends JpaRepository<MomoPaymentMethod, String> {

    Optional<MomoPaymentMethod> findFirstByOrderByCreatedAtAsc();
}
