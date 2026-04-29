package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.OauthAccount;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface OauthAccountRepository extends ReactiveCrudRepository<OauthAccount, UUID> {

    Flux<OauthAccount> findAllByAccountId(UUID accountId);

    Mono<OauthAccount> findByProviderAndProviderUserId(String provider, String providerUserId);
}
