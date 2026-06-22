package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    @Query("SELECT c FROM Customer c LEFT JOIN c.membership m WHERE c.email = :email")
    Optional<Customer> findMembershipByCustomerId(String email);
}
