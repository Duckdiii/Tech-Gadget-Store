package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.GoodsReceiptRequest;
import com.project.tech_gadget_store.dto.response.InventoryLogResponse;

import java.util.UUID;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface InventoryService {
    Mono<Void> importGoods(UUID productId, GoodsReceiptRequest request);

    Mono<Void> lockStockForOrder(UUID orderId);

    Mono<Void> unlockStockForCanceledOrder(UUID orderId);

    Mono<Void> deductStockForCompletedOrder(UUID orderId);

    Flux<InventoryLogResponse> getStockLedger(UUID variantId);

    void checkAndAlertLowStock();
}
