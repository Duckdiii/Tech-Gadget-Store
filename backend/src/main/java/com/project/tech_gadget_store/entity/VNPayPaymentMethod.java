package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "vnpay_payment_methods")
@DiscriminatorValue("VNPAY")
@Getter
@Setter
public class VNPayPaymentMethod extends PaymentMethod {

    @Column(name = "terminal_code", length = 100)
    private String terminalCode;

    @Column(name = "endpoint_url", length = 500)
    private String endpointUrl;

    @Column(name = "return_url", length = 500)
    private String returnUrl;

    @Column(name = "hash_secret", length = 255)
    private String hashSecret;
}
