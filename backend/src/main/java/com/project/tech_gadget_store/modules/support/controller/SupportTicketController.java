package com.project.tech_gadget_store.modules.support.controller;

import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.support.dto.request.SupportTicketRequestDto;
import com.project.tech_gadget_store.modules.support.dto.response.SupportTicketResponseDto;
import com.project.tech_gadget_store.modules.support.service.SupportTicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/customer/support/tickets")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;
    private final CustomerRepository customerRepository;

    public SupportTicketController(SupportTicketService supportTicketService, CustomerRepository customerRepository) {
        this.supportTicketService = supportTicketService;
        this.customerRepository = customerRepository;
    }

    @PostMapping
    public ResponseEntity<SupportTicketResponseDto> createTicket(
            @Valid @RequestBody SupportTicketRequestDto request,
            Authentication authentication) {
        SupportTicketResponseDto result = supportTicketService.createTicket(resolveCustomerId(authentication), request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicketResponseDto>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(supportTicketService.getMyTickets(resolveCustomerId(authentication)));
    }

    private String resolveCustomerId(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        return customer.getId();
    }
}
