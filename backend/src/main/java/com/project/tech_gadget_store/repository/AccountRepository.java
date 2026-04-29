package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Account;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface AccountRepository extends ReactiveCrudRepository<Account, UUID> {

    Mono<Account> findByEmail(String email);

    Mono<Account> findByPhoneNumber(String phoneNumber);

    Flux<Account> findAllByIsActive(Boolean isActive);

    Mono<Boolean> existsByEmail(String email);

    Mono<Boolean> existsByPhoneNumber(String phoneNumber);
}
