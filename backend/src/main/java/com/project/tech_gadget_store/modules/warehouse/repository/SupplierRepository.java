package com.project.tech_gadget_store.modules.warehouse.repository;

import com.project.tech_gadget_store.modules.warehouse.entity.Supplier;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;



public interface SupplierRepository extends JpaRepository<Supplier, String> {

    boolean existsByNameIgnoreCase(String name);

    List<Supplier> findAllByIsActiveTrue();

    Optional<Supplier> findByIdAndIsActiveTrue(String id);

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
}
