package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.GoodsReceiptRequest;
import com.project.tech_gadget_store.dto.response.InventoryLogResponse;
import com.project.tech_gadget_store.entity.InventoryLedger;
import com.project.tech_gadget_store.repository.InventoryLedgerRepository;
import com.project.tech_gadget_store.service.InventoryService;
import com.project.tech_gadget_store.repository.ProductVariantRepository;

import java.util.UUID;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final ProductVariantRepository variantProductRepository;
    private final InventoryLedgerRepository inventoryLedgerRepository;

    @Override
    public Mono<Void> importGoods(UUID adminId, GoodsReceiptRequest request) {
        return variantProductRepository.findById(request.getVariantId())
                .switchIfEmpty(Mono.error(new RuntimeException("Product variant not found")))
                .flatMap(variant -> {
                    int currentStock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
                    InventoryLedger ledger = InventoryLedger.createImportLedger(
                            variant.getId(),
                            request.getQuantity(),
                            request.getNote(),
                            adminId);
                    int incoming = ledger.getQuantityChanged();

                    return inventoryLedgerRepository.save(ledger)
                            .then(variantProductRepository.setStockQuantity(variant.getId(), currentStock + incoming))
                            .then();
                });

    }

    @Override
    public Mono<Void> lockStockForOrder(UUID orderId) {
        // Implementation for locking stock for an order
        return Mono.empty();
    }

    @Override
    public Mono<Void> unlockStockForCanceledOrder(UUID orderId) {
        // Implementation for unlocking stock for a canceled order
        return Mono.empty();
    }

    @Override
    public Mono<Void> deductStockForCompletedOrder(UUID orderId) {
        // Implementation for deducting stock for a completed order
        return Mono.empty();
    }

    @Override
    public Flux<InventoryLogResponse> getStockLedger(UUID variantId) {
        return inventoryLedgerRepository.findAllByVariantId(variantId)
                .map(ledger -> new InventoryLogResponse(
                        ledger.getId(),
                        ledger.getVariantId(),
                        ledger.getTransactionType(),
                        ledger.getQuantityChanged(),
                        null,
                        null,
                        ledger.getReferenceId() == null ? null : ledger.getReferenceId().toString(),
                        ledger.getNote(),
                        ledger.getCreatedAt() == null ? null : ledger.getCreatedAt().toLocalDateTime()));
    }

    @Override
    public void checkAndAlertLowStock() {
        // Implementation for checking and alerting low stock
    }
}
