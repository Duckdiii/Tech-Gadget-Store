package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {
}
