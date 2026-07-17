package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ManagerRepository extends JpaRepository<Manager, String> {
}
