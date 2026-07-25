package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.stereotype.Component;


@Component
@ConfigurationProperties(prefix = "app.payment.vnpay")
@Getter
@Setter
public class VNPayProperties {

    @NestedConfigurationProperty
    private Gateway sandbox = new Gateway();

    @NestedConfigurationProperty
    private Gateway production = new Gateway();

    /**
     * Cấu hình đang active: Production chỉ được dùng khi cả hai điều kiện đều đúng —
     * global sandbox mode tắt (app.payment.default-sandbox-mode=false) VÀ cổng VNPay
     * đã bật riêng (app.payment.vnpay.production.enabled=true). Thiếu một trong hai,
     * luôn rơi về Sandbox để tránh vô tình đẩy giao dịch thật khi chưa sẵn sàng.
     */
    public Gateway active(boolean globalSandboxMode) {
        boolean useProduction = !globalSandboxMode && production.isEnabled();
        return useProduction ? production : sandbox;
    }

    @Getter
    @Setter
    public static class Gateway {
        private boolean enabled;
        private String version = "2.1.0";
        private String paymentUrl;
        private String tmnCode;
        private String hashSecret;
        private String returnUrl;
        private String locale = "vn";
        private String orderType = "200000";
    }
}
