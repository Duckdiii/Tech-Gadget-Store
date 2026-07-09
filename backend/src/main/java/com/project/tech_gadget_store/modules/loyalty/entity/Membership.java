package com.project.tech_gadget_store.modules.loyalty.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Table(name = "memberships", uniqueConstraints = @UniqueConstraint(name = "uk_memberships_tier", columnNames = "tier"))
@Getter
@Setter

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Membership extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false, length = 30)
    private MembershipTier tier;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "benefit_id", nullable = false, unique = true)
    private MembershipBenefit benefit;

    @Column(name = "min_spending", precision = 15, scale = 2)
    private BigDecimal minSpending;

    @Column(name = "max_spending", precision = 15, scale = 2)
    private BigDecimal maxSpending;

    @OneToMany(mappedBy = "membership", fetch = FetchType.LAZY)
    private List<Customer> customers = new ArrayList<>();

    public Membership(MembershipTier tier, MembershipBenefit benefit, BigDecimal minSpending, BigDecimal maxSpending) {
        if (tier == null) {
            throw new IllegalArgumentException("tier must not be null");
        }
        if (benefit == null) {
            throw new IllegalArgumentException("benefit must not be null");
        }
        this.tier = tier;
        this.benefit = benefit;
        changeSpendingRange(minSpending, maxSpending);
    }

    public boolean isSpendingInRange(BigDecimal spending) {
        if (spending == null) {
            throw new IllegalArgumentException("spending must not be null");
        }
        if (minSpending != null && spending.compareTo(minSpending) < 0) {
            return false;
        }
        return maxSpending == null || spending.compareTo(maxSpending) <= 0;
    }

    public void addCustomer(Customer customer) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (customer.getMembership() != null && customer.getMembership() != this) {
            customer.getMembership().getCustomers().remove(customer);
        }
        if (!customers.contains(customer)) {
            customers.add(customer);
        }
        customer.setMembership(this);
    }

    public void removeCustomer(Customer customer) {
        if (customer == null) {
            return;
        }
        if (customers.remove(customer)) {
            customer.setMembership(null);
        }
    }

    public void changeSpendingRange(BigDecimal min, BigDecimal max) {
        if (min != null && min.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("min must not be negative");
        }
        if (max != null && max.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("max must not be negative");
        }
        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new IllegalArgumentException("min must not be greater than max");
        }
        minSpending = min;
        maxSpending = max;
    }
}
