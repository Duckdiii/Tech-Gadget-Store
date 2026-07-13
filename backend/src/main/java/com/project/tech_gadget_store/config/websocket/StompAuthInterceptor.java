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
 * Xác thực đúng lúc client gửi STOMP CONNECT frame (không phải lúc handshake
 * HTTP nâng cấp
 * WebSocket — trình duyệt không set được header tuỳ ý ở bước đó). Đọc lại JWT
 * gửi kèm trong
 * header "Authorization" của frame CONNECT, dùng chung {@link JwtService} với
 * REST API, gán
 * Principal (email) cho phiên WebSocket để {@code convertAndSendToUser} tìm
 * đúng người nhận.
 */
@Component
@RequiredArgsConstructor
// Lớp này kế thừa ChannelInterceptor, đóng vai trò đánh chặn luồng tin nhắn đi
// từ Client lên Server

// Bắt Client xuất trình Token (JWT) khi xin kết nối, kiểm tra thật giả, và nếu
// hợp lệ thì đóng dấu "đã xác thực" cho User đó
public class StompAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    // Hàm này tự động chạy trước khi tin nhắn thực sự được gửi đến đích
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // Một công cụ giúp Spring lột vỏ gói tin thô ra để đọc các thông tin của giao
        // thức STOMP (như các Header, các lệnh)
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        // kiểm tra khi Client gửi lệnh CONNECT
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Hệ thống thò tay vào Header của STOMP Frame để tìm header có tên là
            // Authorization
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing or malformed Authorization header");
            }
            // Lấy token ra khỏi header Authorization
            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                throw new IllegalArgumentException("Invalid or expired token");
            }

            String email = jwtService.extractEmail(token);
            Principal principal = () -> email;
            accessor.setUser(principal);
            accessor.setLeaveMutable(true);
            return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
        }

        return message;
    }
}
