package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.PaymentLogFilterRequestDto;
import com.project.tech_gadget_store.dto.response.PaymentLogResponseDto;
import com.project.tech_gadget_store.service.PaymentLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/payment-logs")
public class PaymentLogController {

    private final PaymentLogService paymentLogService;

    public PaymentLogController(PaymentLogService paymentLogService) {
        this.paymentLogService = paymentLogService;
    }

    @GetMapping
    public ResponseEntity<com.project.tech_gadget_store.dto.response.CursorPageResponseDto<PaymentLogResponseDto>> getPaymentLogs(
            @ModelAttribute PaymentLogFilterRequestDto filter,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(paymentLogService.getPaymentLogsCursor(filter, cursor, limit));
    }

    @GetMapping("/{logId}")
    public ResponseEntity<PaymentLogResponseDto> getPaymentLogDetails(@PathVariable String logId) {
        return ResponseEntity.ok(paymentLogService.getPaymentLogDetails(logId));
    }
}
