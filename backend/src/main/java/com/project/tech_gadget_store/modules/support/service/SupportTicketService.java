package com.project.tech_gadget_store.modules.support.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.support.dto.request.SupportTicketRequestDto;
import com.project.tech_gadget_store.modules.support.dto.response.SupportTicketResponseDto;
import com.project.tech_gadget_store.modules.support.entity.SupportTicket;
import com.project.tech_gadget_store.modules.support.repository.SupportTicketRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final CustomerRepository customerRepository;

    public SupportTicketService(SupportTicketRepository supportTicketRepository, CustomerRepository customerRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public SupportTicketResponseDto createTicket(String customerId, SupportTicketRequestDto request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
        SupportTicket ticket = new SupportTicket(customer, request.getSubject(), request.getCategory(), request.getMessage());
        return toDto(supportTicketRepository.save(ticket));
    }

    public List<SupportTicketResponseDto> getMyTickets(String customerId) {
        return supportTicketRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toDto)
                .toList();
    }

    private SupportTicketResponseDto toDto(SupportTicket t) {
        return SupportTicketResponseDto.builder()
                .id(t.getId())
                .subject(t.getSubject())
                .category(t.getCategory())
                .message(t.getMessage())
                .status(t.getStatus().name())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
