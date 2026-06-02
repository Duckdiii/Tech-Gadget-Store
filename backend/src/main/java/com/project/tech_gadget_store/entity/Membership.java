package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.MembershipTier;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "memberships",
        uniqueConstraints = @UniqueConstraint(name = "uk_memberships_tier", columnNames = "tier")
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Membership extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false, length = 30)
    private MembershipTier tier;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "benefit_id", unique = true)
    private MembershipBenefit benefit;

    @Column(name = "min_spending", precision = 15, scale = 2)
    private BigDecimal minSpending;

    @Column(name = "max_spending", precision = 15, scale = 2)
    private BigDecimal maxSpending;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "membership", fetch = FetchType.LAZY)
    private List<Customer> customers = new ArrayList<>();

    @PrePersist
    @PreUpdate
    protected void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }

    public Membership(MembershipTier tier, MembershipBenefit benefit, BigDecimal minSpending, BigDecimal maxSpending) {
        this.tier = tier;
        this.benefit = benefit;
        this.minSpending = minSpending;
        this.maxSpending = maxSpending;
    }
}
