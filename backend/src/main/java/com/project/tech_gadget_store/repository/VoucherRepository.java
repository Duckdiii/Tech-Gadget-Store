package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Voucher;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface VoucherRepository extends ReactiveCrudRepository<Voucher, UUID> {

    Mono<Voucher> findByCode(String code);

    Mono<Boolean> existsByCode(String code);
}
