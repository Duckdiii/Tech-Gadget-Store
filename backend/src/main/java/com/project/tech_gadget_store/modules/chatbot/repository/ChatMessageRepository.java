package com.project.tech_gadget_store.modules.chatbot.repository;

import com.project.tech_gadget_store.modules.chatbot.entity.ChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}
