package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ChatSession;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface ChatSessionRepository extends ReactiveCrudRepository<ChatSession, UUID> {

    Flux<ChatSession> findAllByAccountId(UUID accountId);
}
