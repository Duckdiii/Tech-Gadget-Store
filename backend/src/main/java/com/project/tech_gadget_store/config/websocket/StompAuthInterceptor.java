package com.project.tech_gadget_store.config.websocket;

import com.project.tech_gadget_store.modules.auth.service.JwtService;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

/**
 * Xác thực đúng lúc client gửi STOMP CONNECT frame (không phải lúc handshake HTTP nâng cấp
 * WebSocket — trình duyệt không set được header tuỳ ý ở bước đó). Đọc lại JWT gửi kèm trong
 * header "Authorization" của frame CONNECT, dùng chung {@link JwtService} với REST API, gán
 * Principal (email) cho phiên WebSocket để {@code convertAndSendToUser} tìm đúng người nhận.
 */
@Component
@RequiredArgsConstructor
public class StompAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing or malformed Authorization header");
            }

            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                throw new IllegalArgumentException("Invalid or expired token");
            }

            String email = jwtService.extractEmail(token);
            Principal principal = () -> email;
            accessor.setUser(principal);

            // accessor.setUser(...) chỉ sửa header trên "view" tạm thời — phải build lại
            // Message từ chính accessor này thì Principal mới thực sự gắn vào message trả
            // về, để SimpUserRegistry đăng ký đúng phiên cho convertAndSendToUser tìm ra sau này.
            accessor.setLeaveMutable(true);
            return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
        }

        return message;
    }
}
