package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.modules.auth.dto.response.CustomerDetailResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerListStatsDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerPageResponseDto;
import com.project.tech_gadget_store.modules.auth.service.CustomerManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(customerManagementService.listCustomers(search, tier, page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<CustomerListStatsDto> getStats() {
        return ResponseEntity.ok(customerManagementService.getStatsSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailResponseDto> getCustomerDetail(@PathVariable String id) {
        return ResponseEntity.ok(customerManagementService.getCustomerDetail(id));
    }
}
