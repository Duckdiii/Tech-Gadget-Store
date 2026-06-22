package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.payment.momo.sandbox")
@Getter
@Setter
public class MomoProperties {

    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String endpoint;
    private String redirectUrl;
    private String ipnUrl;
    private String requestType = "captureWallet";
    private String partnerName = "TechStore";
    private String storeId = "TechStore001";
    private String lang = "vi";
}
