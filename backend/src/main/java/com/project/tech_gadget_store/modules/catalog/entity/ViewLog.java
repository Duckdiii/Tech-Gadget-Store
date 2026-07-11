package com.project.tech_gadget_store.modules.catalog.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Records that a logged-in customer viewed a product's detail page — powers "Bạn vừa xem"
 * (recently viewed) and "Gợi ý từ lịch sử" (suggestions based on view history). Append-only:
 * one row per view, no update/delete needed.
 */
@Entity
@Table(name = "view_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ViewLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;

    @PrePersist
    protected void prePersistViewLog() {
        if (viewedAt == null) {
            viewedAt = LocalDateTime.now();
        }
    }

    public ViewLog(Customer customer, Product product) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        this.customer = customer;
        this.product = product;
    }
}
