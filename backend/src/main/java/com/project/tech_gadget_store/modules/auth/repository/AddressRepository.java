package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.Address;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;



public interface AddressRepository extends JpaRepository<Address, String> {

    @Query(value = "SELECT * FROM addresses WHERE user_id = :customerId", nativeQuery = true)
    List<Address> findByCustomerId(String customerId);
}
