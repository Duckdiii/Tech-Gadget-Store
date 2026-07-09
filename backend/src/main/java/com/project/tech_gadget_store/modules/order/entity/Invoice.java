package com.project.tech_gadget_store.modules.order.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;



@Entity
@Table(name = "invoices")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "original_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal originalAmount;

    @Column(name = "vat_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal vatAmount;

    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "final_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @PrePersist
    protected void prePersistInvoice() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
    }

    public Invoice(Order order, BigDecimal originalAmount, BigDecimal vatAmount,
            BigDecimal discountAmount, BigDecimal finalAmount) {
        if (order == null) {
            throw new IllegalArgumentException("order must not be null");
        }
        if (originalAmount == null) {
            throw new IllegalArgumentException("originalAmount must not be null");
        }
        if (vatAmount == null) {
            throw new IllegalArgumentException("vatAmount must not be null");
        }
        if (discountAmount == null) {
            throw new IllegalArgumentException("discountAmount must not be null");
        }
        if (finalAmount == null) {
            throw new IllegalArgumentException("finalAmount must not be null");
        }
        this.order = order;
        this.originalAmount = originalAmount;
        this.vatAmount = vatAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
    }
}
