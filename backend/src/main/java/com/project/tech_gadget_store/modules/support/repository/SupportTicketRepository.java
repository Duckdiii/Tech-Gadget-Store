package com.project.tech_gadget_store.modules.support.repository;

import com.project.tech_gadget_store.modules.support.entity.SupportTicket;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {
    List<SupportTicket> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
