package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.payment.vnpay.sandbox")
@Getter
@Setter
public class VNPayProperties {

    private String version = "2.1.0";
    private String paymentUrl;
    private String tmnCode;
    private String hashSecret;
    private String returnUrl;
    private String locale = "vn";
    private String orderType = "200000";
}
