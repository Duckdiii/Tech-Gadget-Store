package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.modules.auth.dto.request.BulkPromotionRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.request.BulkStatusRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.request.CustomerNoteRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerDetailResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerListStatsDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerNoteResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.CustomerPageResponseDto;
import com.project.tech_gadget_store.modules.auth.service.CustomerManagementService;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    public ResponseEntity<CustomerNoteResponseDto> addNote(
            @PathVariable String customerId,
            @Valid @RequestBody CustomerNoteRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(customerManagementService.addNote(customerId, authentication.getName(), request.getContent()));
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<CustomerNoteResponseDto> updateNote(
            @PathVariable String noteId,
            @Valid @RequestBody CustomerNoteRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(customerManagementService.updateNote(noteId, authentication.getName(), request.getContent()));
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable String noteId) {
        customerManagementService.deleteNote(noteId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk-status")
    public ResponseEntity<Void> bulkUpdateStatus(@Valid @RequestBody BulkStatusRequestDto request) {
        customerManagementService.bulkUpdateStatus(request.getAccountIds(), request.getStatus());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk-promotion")
    public ResponseEntity<Map<String, String>> bulkSendPromotion(@Valid @RequestBody BulkPromotionRequestDto request) {
        String resultMsg = customerManagementService.bulkSendPromotion(request.getCustomerIds(), request.getMessage());
        return ResponseEntity.ok(Map.of("message", resultMsg));
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportCustomers(@RequestBody List<String> customerIds) {
        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFF"); // UTF-8 BOM
        csv.append("Mã KH,Họ tên,Email,Số điện thoại,Hạng,Tổng chi tiêu,Tổng đơn hàng,Ngày đăng ký\n");

        for (String id : customerIds) {
            try {
                CustomerDetailResponseDto detail = customerManagementService.getCustomerDetail(id);
                csv.append(detail.getId()).append(",")
                   .append(escapeCsv(detail.getFullName())).append(",")
                   .append(escapeCsv(detail.getEmail())).append(",")
                   .append(escapeCsv(detail.getPhone())).append(",")
                   .append(detail.getTier()).append(",")
                   .append(detail.getTotalSpend()).append(",")
                   .append(detail.getTotalOrders()).append(",")
                   .append(detail.getJoinDate()).append("\n");
            } catch (Exception e) {
                // skip if not found
            }
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=danh_sach_khach_hang.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
