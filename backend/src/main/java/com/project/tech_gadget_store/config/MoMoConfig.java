package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@ConfigurationProperties(prefix = "app.payment.momo")
@Getter
@Setter
public class MoMoConfig {
    private GatewayProfile sandbox = new GatewayProfile();
    private GatewayProfile production = new GatewayProfile();

    public GatewayProfile getActiveProfile(boolean sandboxMode) {
        return sandboxMode ? sandbox : production;
    }

    @Getter
    @Setter
    public static class GatewayProfile {
        private boolean enabled;
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String publicKey;
        private String endpoint;
        private String redirectUrl;
        private String ipnUrl;
        private String requestType;
        private String partnerName;
        private String storeId;
        private String lang;
        private BigDecimal feeRate;
    }
}
