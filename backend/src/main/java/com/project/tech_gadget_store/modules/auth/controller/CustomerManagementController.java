package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.modules.auth.dto.response.CustomerDetailResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerListStatsDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerPageResponseDto;
import com.project.tech_gadget_store.modules.auth.service.CustomerManagementService;
import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;


/**
 * Manager-facing customer list/detail, backing the "Khách hàng" (Customer Management) page.
 * frontend/src/features/manager-users/services/managerUsersService.js already called
 * GET /api/manager/customers and GET /api/manager/customers/{id} before this controller
 * existed — those calls 404'd, and the page rendered hardcoded mock data instead.
 */
@RestController
@RequestMapping("/api/manager/customers")
public class CustomerManagementController {

    private final CustomerManagementService customerManagementService;

    public CustomerManagementController(CustomerManagementService customerManagementService) {
        this.customerManagementService = customerManagementService;
    }

    @GetMapping
    public ResponseEntity<CustomerPageResponseDto> listCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) String joinStartDate,
            @RequestParam(required = false) String joinEndDate,
            @RequestParam(required = false) BigDecimal minSpend,
            @RequestParam(required = false) BigDecimal maxSpend,
            @RequestParam(required = false) Boolean onlyRepeat,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(customerManagementService.listCustomers(
                search, tier, joinStartDate, joinEndDate, minSpend, maxSpend, onlyRepeat, sortBy, sortDir, page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<CustomerListStatsDto> getStats() {
        return ResponseEntity.ok(customerManagementService.getStatsSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailResponseDto> getCustomerDetail(@PathVariable String id) {
        return ResponseEntity.ok(customerManagementService.getCustomerDetail(id));
    }

    @PostMapping("/{customerId}/notes")
    public ResponseEntity<com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto> addNote(
            @PathVariable String customerId,
            @Valid @RequestBody com.project.tech_gadget_store.modules.auth.dto.request.CustomerNoteRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(customerManagementService.addNote(customerId, authentication.getName(), request.getContent()));
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto> updateNote(
            @PathVariable String noteId,
            @Valid @RequestBody com.project.tech_gadget_store.modules.auth.dto.request.CustomerNoteRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(customerManagementService.updateNote(noteId, authentication.getName(), request.getContent()));
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable String noteId) {
        customerManagementService.deleteNote(noteId);
        return ResponseEntity.ok().build();
    }
}
