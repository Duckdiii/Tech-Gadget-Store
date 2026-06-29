package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, String> {

    boolean existsByNameIgnoreCase(String name);

    List<Supplier> findAllByIsActiveTrue();

    Optional<Supplier> findByIdAndIsActiveTrue(String id);

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
}
