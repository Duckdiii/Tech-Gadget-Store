package com.project.tech_gadget_store.modules.loyalty.repository;

import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface BundleServiceRepository extends JpaRepository<BundleService, String> {

    List<BundleService> findByActiveTrue();
}
