package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.BundleService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BundleServiceRepository extends JpaRepository<BundleService, String> {

    List<BundleService> findByActiveTrue();
}
