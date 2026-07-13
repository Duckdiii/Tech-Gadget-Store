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
 * STOMP over WebSocket cho thông báo real-time (xem {@code OrderNotificationConsumer}).
 * Dùng simple broker in-memory — đủ cho quy mô 1 instance, không cần RabbitMQ làm STOMP relay.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthInterceptor stompAuthInterceptor;

    // Cùng property với CorsConfigurationSource (SecurityConfig) — Spring WebSocket mặc định
    // chỉ chấp nhận handshake same-origin, và khi đi qua Nginx (cổng nội bộ khác cổng ngoài),
    // nó không tự suy ra đúng origin nên cần khai báo tường minh, không thì bị từ chối 403.
    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns(allowedOrigins.split(","));
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // "/queue" BẮT BUỘC phải khai ở đây — UserDestinationMessageHandler dịch
        // "/user/{email}/queue/notifications" thành "/queue/notifications-user{sessionId}",
        // nhưng nếu SimpleBrokerMessageHandler không được khai nhận "/queue" làm prefix của
        // nó, nó âm thầm bỏ qua toàn bộ subscribe/message thuộc prefix đó (đã tự debug ra
        // bug này — log "Translated" hiện đúng, nhưng message không bao giờ tới client).
        // "/topic" dự phòng cho broadcast chung (không dùng hiện tại). LƯU Ý: "/user" KHÔNG
        // được liệt vào đây — nếu đưa vào, SimpleBrokerMessageHandler sẽ tự xử lý luôn
        // destination "/user/queue/..." nguyên văn, chặn trước khi UserDestinationMessageHandler
        // kịp dịch nó thành đúng địa chỉ riêng của từng phiên.
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompAuthInterceptor);
    }
}
