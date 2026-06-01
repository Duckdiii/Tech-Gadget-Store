package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

@Entity
@Table(name = "membership_benefits")
@Getter
@Setter
public class MembershipBenefit extends BaseEntity {

    @Column(name = "discount_percentage", nullable = false)
    private Double discountPercentage;

    @Column(name = "free_shipping", nullable = false)
    private Boolean freeShipping = false;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
