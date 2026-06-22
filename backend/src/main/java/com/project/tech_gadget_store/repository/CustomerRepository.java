package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, String> {

}
