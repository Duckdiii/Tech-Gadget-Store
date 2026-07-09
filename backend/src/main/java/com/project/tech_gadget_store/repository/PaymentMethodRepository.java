package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, String> {
}
