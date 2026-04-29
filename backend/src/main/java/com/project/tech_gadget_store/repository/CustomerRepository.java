package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.enums.MembershipTier;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface CustomerRepository extends ReactiveCrudRepository<Customer, UUID> {

    Mono<Customer> findByAccountId(UUID accountId);

    Mono<Customer> findByPhoneNumber(String phoneNumber);

    Flux<Customer> findAllByMembershipTier(MembershipTier membershipTier);
}
