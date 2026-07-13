package com.project.tech_gadget_store.config.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over WebSocket cho thông báo real-time (xem
 * {@code OrderNotificationConsumer}).
 * Dùng simple broker in-memory — đủ cho quy mô 1 instance, không cần RabbitMQ
 * làm STOMP relay.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer { // lớp cấu hình hệ thống tin nhắn WebSocket
                                                                           // dùng STOMP

    private final StompAuthInterceptor stompAuthInterceptor; // interceptor xác thực JWT khi client gửi STOMP CONNECT
                                                             // frame (xem
    // StompAuthInterceptor)
    @Value("${cors.allowed-origins:http://localhost:5173}") // đọc từ application.properties, mặc định cho phép origin
                                                            // của frontend dev server
    private String allowedOrigins; // danh sách origin được phép kết nối WebSocket, phân tách bằng dấu phẩy

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // addEndpoint("/ws"): Định nghĩa cái "địa chỉ nhà" để phía Frontend (Client)
        // gọi vào làm thủ tục bắt tay (Handshake). Khi Client muốn kết nối WebSocket,
        // nó phải gọi lên url kiểu như: ws://localhost:8080/ws.
        registry.addEndpoint("/ws").setAllowedOriginPatterns(allowedOrigins.split(","));// Nó cho phép các ứng dụng
                                                                                        // Frontend nằm ở domain khác
                                                                                        // (ví dụ cái cổng 5173 ở trên)
                                                                                        // được phép kết nối vào Server
                                                                                        // Spring Boot này mà không bị
                                                                                        // trình duyệt chặn lại.
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Mở ra 2 tuyến đường chính để Client đăng ký nhận tin (SUBSCRIBE)
        // topic: Dùng cho broadcast (ví dụ thông báo chung cho tất cả khách hàng)
        // queue: Dùng cho tin nhắn riêng tư (ví dụ thông báo chỉ gửi cho 1 khách hàng
        // cụ thể)
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setUserDestinationPrefix("/user"); // gửi tin nhắn riêng tư cho một User cụ thể
    }

    @Override
    // InboundChannel: Là luồng tin nhắn đi từ phía Client bắn lên Server (ví dụ:
    // lệnh kết nối CONNECT, lệnh gửi tin SEND)
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // interceptors(stompAuthInterceptor): Gắn interceptor xác thực JWT khi Client
        // gửi STOMP CONNECT frame (xem
        registration.interceptors(stompAuthInterceptor);
    }
}
