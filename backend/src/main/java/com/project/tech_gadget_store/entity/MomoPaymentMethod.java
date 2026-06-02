package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "momo_payment_methods")
@DiscriminatorValue("MOMO")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MomoPaymentMethod extends PaymentMethod {

    @Column(name = "partner_code", length = 100)
    private String partnerCode;

    @Column(name = "merchant_id", length = 100)
    private String merchantId;

    @Column(name = "endpoint_url", length = 500)
    private String endpointUrl;

    @Column(name = "return_url", length = 500)
    private String returnUrl;

    @Column(name = "notify_url", length = 500)
    private String notifyUrl;

    public MomoPaymentMethod(String name, String description, String partnerCode, String merchantId,
            String endpointUrl, String returnUrl, String notifyUrl) {
        super(name, description);
        this.partnerCode = partnerCode;
        this.merchantId = merchantId;
        this.endpointUrl = endpointUrl;
        this.returnUrl = returnUrl;
        this.notifyUrl = notifyUrl;
    }
}
