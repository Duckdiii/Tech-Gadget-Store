package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.CustomerNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerNoteRepository extends JpaRepository<CustomerNote, String> {
    List<CustomerNote> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
