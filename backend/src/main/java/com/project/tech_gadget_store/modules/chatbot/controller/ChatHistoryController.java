package com.project.tech_gadget_store.modules.chatbot.controller;

import com.project.tech_gadget_store.common.constants.ErrorMessages;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.chatbot.dto.response.ChatMessageResponseDto;
import com.project.tech_gadget_store.modules.chatbot.entity.ChatConversation;
import com.project.tech_gadget_store.modules.chatbot.repository.ChatConversationRepository;
import com.project.tech_gadget_store.modules.chatbot.repository.ChatMessageRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatHistoryController {

    private final CustomerRepository customerRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ChatHistoryController(
            CustomerRepository customerRepository,
            ChatConversationRepository chatConversationRepository,
            ChatMessageRepository chatMessageRepository) {
        this.customerRepository = customerRepository;
        this.chatConversationRepository = chatConversationRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageResponseDto>> getHistory(Authentication authentication) {
        String customerId = resolveCustomerId(authentication);
        Optional<ChatConversation> conversation =
                chatConversationRepository.findTopByCustomerIdOrderByCreatedAtDesc(customerId);
        if (conversation.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<ChatMessageResponseDto> history = chatMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversation.get().getId())
                .stream()
                .map(message -> ChatMessageResponseDto.builder()
                        .id(message.getId())
                        .role(message.getRole())
                        .content(message.getContent())
                        .createdAt(message.getCreatedAt())
                        .build())
                .toList();
        return ResponseEntity.ok(history);
    }

    private String resolveCustomerId(Authentication authentication) {
        Customer customer = customerRepository
                .findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND));
        return customer.getId();
    }
}
