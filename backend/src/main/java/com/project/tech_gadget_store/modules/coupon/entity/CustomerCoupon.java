package com.project.tech_gadget_store.modules.coupon.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Một mã coupon mà khách đã "lưu" (claim) vào tài khoản của mình. */
@Entity
@Table(name = "customer_coupons", uniqueConstraints = @UniqueConstraint(name = "uk_customer_coupon", columnNames = { "customer_id", "coupon_id" }))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerCoupon extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    public CustomerCoupon(Customer customer, Coupon coupon) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (coupon == null) {
            throw new IllegalArgumentException("coupon must not be null");
        }
        this.customer = customer;
        this.coupon = coupon;
    }
}
