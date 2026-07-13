package com.project.tech_gadget_store.common.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Tags every request with a correlation ID (MDC key {@link #MDC_KEY}),
 * propagated onward to
 * RabbitMQ consumers (see
 * {@link com.project.tech_gadget_store.modules.order.service.CheckoutFacade})
 * so 1 checkout's async fan-out (email/invoice/notification) can be grepped as
 * 1 story in logs.
 * Registered as a plain servlet filter (not via SecurityConfig) with highest
 * precedence so it
 * wraps the Spring Security chain too.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String MDC_KEY = "correlationId"; // MDC_KEY là tên chìa khoá dùng để lưu/đọc trong MDC
    private static final String HEADER = "X-Correlation-Id"; // HEADER là tên header HTTP dùng để gửi/nhận ID đó qua
                                                             // mạng

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException { // là phương thức xử lý lọc yêu cầu HTTP, được gọi cho mỗi yêu cầu
                                                   // đến
        String correlationId = request.getHeader(HEADER); // xem request gửi tới đã có sẵn X-Correlation-Id chưa
        // nếu sau này bạn có nhiều service gọi lẫn nhau (ví dụ service A gọi service
        // B), và A đã tự gắn sẵn 1 ID, thì B nên dùng lại đúng ID đó thay vì tự sinh
        // cái mới
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put(MDC_KEY, correlationId);
        response.setHeader(HEADER, correlationId); // Gửi ngược lại đúng ID đó vào response header trả về cho trình
                                                   // duyệt
        try {
            filterChain.doFilter(request, response);
        } finally {
            // vì server dùng lại (pool) các thread giữa nhiều request khác nhau, nếu không
            // xoá, correlationId của request này sẽ còn sót lại trong MDC khi thread đó
            // được tái sử dụng để xử lý request tiếp theo
            MDC.remove(MDC_KEY);
        }
    }
}
