package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "membership_benefits")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MembershipBenefit extends BaseEntity {

    @Column(name = "discount_percentage", nullable = false)
    private Double discountPercentage;

    @Column(name = "free_shipping", nullable = false)
    private Boolean freeShipping = false;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public MembershipBenefit(Double discountPercentage, Boolean freeShipping, String description) {
        this.discountPercentage = discountPercentage;
        this.freeShipping = freeShipping;
        this.description = description;
    }
}
