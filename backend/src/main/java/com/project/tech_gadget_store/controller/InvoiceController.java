package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.response.InvoiceResponseDto;
import com.project.tech_gadget_store.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<InvoiceResponseDto> getOrCreateInvoice(
            @PathVariable String orderId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(invoiceService.getOrCreateInvoice(orderId, email));
    }

    @GetMapping("/order/{orderId}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable String orderId,
            Authentication authentication) {
        String email = authentication.getName();
        byte[] pdfBytes = invoiceService.generateInvoicePdf(orderId, email);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice_" + orderId + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
