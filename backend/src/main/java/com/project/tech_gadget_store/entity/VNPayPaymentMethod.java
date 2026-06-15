package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("VNPAY")
@Getter
@Setter

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VNPayPaymentMethod extends PaymentMethod {

    @Column(name = "terminal_code", length = 100)
    private String terminalCode;

    @Column(name = "endpoint_url", length = 500)
    private String endpointUrl;

    @Column(name = "return_url", length = 500)
    private String returnUrl;

    @Column(name = "hash_secret", length = 255)
    private String hashSecret;

    public VNPayPaymentMethod(String name, String description, String terminalCode, String endpointUrl,
            String returnUrl, String hashSecret) {
        super(name, description);
        this.terminalCode = terminalCode;
        this.endpointUrl = endpointUrl;
        this.returnUrl = returnUrl;
        this.hashSecret = hashSecret;
    }

    public boolean isConfigured() {
        return !isBlank(terminalCode)
                && !isBlank(endpointUrl)
                && !isBlank(returnUrl)
                && !isBlank(hashSecret);
    }

    public void updateConfig(String terminalCode, String endpointUrl, String returnUrl, String hashSecret) {
        if (isBlank(terminalCode)) {
            throw new IllegalArgumentException("terminalCode must not be blank");
        }
        if (isBlank(endpointUrl)) {
            throw new IllegalArgumentException("endpointUrl must not be blank");
        }
        if (isBlank(returnUrl)) {
            throw new IllegalArgumentException("returnUrl must not be blank");
        }
        if (isBlank(hashSecret)) {
            throw new IllegalArgumentException("hashSecret must not be blank");
        }
        this.terminalCode = terminalCode;
        this.endpointUrl = endpointUrl;
        this.returnUrl = returnUrl;
        this.hashSecret = hashSecret;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
