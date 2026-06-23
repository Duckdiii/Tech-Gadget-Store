package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, String> {

    boolean existsByStaffCode(String staffCode);
}
