package com.project.tech_gadget_store.modules.payment.repository;

import com.project.tech_gadget_store.modules.payment.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, String> {
}
