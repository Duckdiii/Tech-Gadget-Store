package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, String> {

    @Query(value = "SELECT * FROM addresses WHERE user_id = :customerId", nativeQuery = true)
    List<Address> findByCustomerId(String customerId);
}
