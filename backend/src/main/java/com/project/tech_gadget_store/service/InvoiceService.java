package com.project.tech_gadget_store.service;

import reactor.core.publisher.Mono;
import java.util.UUID;

public interface InvoiceService {
    Mono<byte[]> generatePdfInvoice(UUID orderId, UUID accountId, String role);
}
