package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {

}
