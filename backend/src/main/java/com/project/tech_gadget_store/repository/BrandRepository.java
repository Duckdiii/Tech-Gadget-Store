package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, String> {
}
