package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Supplier;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface SupplierRepository extends ReactiveCrudRepository<Supplier, UUID> {

    Mono<Supplier> findByAccountId(UUID accountId);

    Mono<Supplier> findByTaxCode(String taxCode);
}
