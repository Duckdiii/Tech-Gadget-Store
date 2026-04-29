package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.InventoryLedger;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface InventoryLedgerRepository extends ReactiveCrudRepository<InventoryLedger, UUID> {

    Flux<InventoryLedger> findAllByVariantId(UUID variantId);

    Flux<InventoryLedger> findAllByCreatedBy(UUID accountId);

    Flux<InventoryLedger> findAllByReferenceId(UUID referenceId);
}
