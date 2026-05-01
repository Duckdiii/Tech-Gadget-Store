package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@ConfigurationProperties(prefix = "app.payment.vnpay")
@Getter
@Setter
public class VnPayConfig {
    private GatewayProfile sandbox = new GatewayProfile();
    private GatewayProfile production = new GatewayProfile();

    public GatewayProfile getActiveProfile(boolean sandboxMode) {
        return sandboxMode ? sandbox : production;
    }

    @Getter
    @Setter
    public static class GatewayProfile {
        private boolean enabled;
        private String version;
        private String paymentUrl;
        private String tmnCode;
        private String hashSecret;
        private String secureSecret;
        private String url;
        private String endpoint;
        private String apiEndpoint;
        private BigDecimal feeRate;
        private String returnUrl;
        private String ipnUrl;
        private String locale;
        private String orderType;
    }
}
