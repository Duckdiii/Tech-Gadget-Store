package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.ViewLog;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ViewLogRepository extends JpaRepository<ViewLog, String> {

    @Query("SELECT vl FROM ViewLog vl WHERE vl.customer.id = :customerId ORDER BY vl.viewedAt DESC")
    List<ViewLog> findRecentByCustomerId(String customerId, Pageable pageable);
}
