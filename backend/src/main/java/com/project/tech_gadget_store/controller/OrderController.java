package com.project.tech_gadget_store.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.security.oauth2.jwt.Jwt;
import reactor.core.publisher.Mono;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import com.project.tech_gadget_store.service.InvoiceService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor

@RestController

public class OrderController {
    private final InvoiceService invoiceService;

    @GetMapping("/{orderId}/invoice")
    public Mono<ResponseEntity<byte[]>> downloadInvoice(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal Jwt jwt) { // Lấy user hiện tại

        return invoiceService.generatePdfInvoice(orderId, UUID.fromString(jwt.getSubject()), jwt.getClaim("role"))
                .map(pdfBytes -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + orderId + ".pdf")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(pdfBytes));
    }
}
