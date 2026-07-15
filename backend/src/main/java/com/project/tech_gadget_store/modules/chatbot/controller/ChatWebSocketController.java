package com.project.tech_gadget_store.modules.chatbot.controller;

import com.project.tech_gadget_store.modules.chatbot.dto.request.ChatSendRequestDto;
import com.project.tech_gadget_store.modules.chatbot.service.ChatbotService;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * Nhận tin nhắn chat qua STOMP (client publish tới {@code /app/chat.send}, xem
 * {@code WebSocketConfig}). Principal đến từ {@code StompAuthInterceptor} — đã xác thực JWT lúc
 * CONNECT, {@code principal.getName()} là email tài khoản.
 */
@Controller
public class ChatWebSocketController {

    private final ChatbotService chatbotService;

    public ChatWebSocketController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatSendRequestDto request, Principal principal) {
        chatbotService.handleMessage(principal.getName(), request.getContent());
    }
}
