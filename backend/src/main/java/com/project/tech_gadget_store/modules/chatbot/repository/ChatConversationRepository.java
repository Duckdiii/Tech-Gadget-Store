package com.project.tech_gadget_store.modules.chatbot.repository;

import com.project.tech_gadget_store.modules.chatbot.entity.ChatConversation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {

    Optional<ChatConversation> findTopByCustomerIdOrderByCreatedAtDesc(String customerId);
}
