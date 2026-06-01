package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "cod_payment_methods")
@DiscriminatorValue("COD")
@Getter
@Setter
public class CODPaymentMethod extends PaymentMethod {

    @Column(name = "max_amount", precision = 15, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "service_fee", precision = 15, scale = 2)
    private BigDecimal serviceFee;
}
