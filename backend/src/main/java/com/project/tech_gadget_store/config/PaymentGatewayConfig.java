package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.payment")
@Getter
@Setter
public class PaymentGatewayConfig {
    private boolean defaultSandboxMode = true;
    private int timeoutMinutes = 15;
    private boolean testAutoComplete = false;

    public int getEffectiveTimeoutMinutes() {
        return timeoutMinutes > 0 ? timeoutMinutes : 15;
    }
}
