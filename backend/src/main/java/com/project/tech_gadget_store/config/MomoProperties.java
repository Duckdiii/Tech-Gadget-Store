package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.stereotype.Component;


@Component
@ConfigurationProperties(prefix = "app.payment.momo")
@Getter
@Setter
public class MomoProperties {

    @NestedConfigurationProperty
    private Gateway sandbox = new Gateway();

    @NestedConfigurationProperty
    private Gateway production = new Gateway();

    /**
     * Cấu hình đang active: Production chỉ được dùng khi cả hai điều kiện đều đúng —
     * global sandbox mode tắt (app.payment.default-sandbox-mode=false) VÀ cổng MoMo
     * đã bật riêng (app.payment.momo.production.enabled=true). Thiếu một trong hai,
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
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String publicKey;
        private String endpoint;
        private String redirectUrl;
        private String ipnUrl;
        private String requestType = "captureWallet";
        private String partnerName = "TechStore";
        private String storeId = "TechStore001";
        private String lang = "vi";
    }
}
