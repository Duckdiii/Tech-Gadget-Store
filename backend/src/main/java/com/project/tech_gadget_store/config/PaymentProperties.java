package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.payment")
@Getter
@Setter
public class PaymentProperties {

    // true = dùng cấu hình Sandbox cho mọi cổng thanh toán (mặc định, an toàn cho Dev/Staging).
    // false = cho phép từng cổng (MoMo/VNPay) tự quyết định dùng Production hay Sandbox dựa vào
    // cờ "production.enabled" riêng của cổng đó — xem MomoProperties#active / VNPayProperties#active.
    private boolean defaultSandboxMode = true;
    private int timeoutMinutes = 15;
    private boolean testAutoComplete = false;
}
