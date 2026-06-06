package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@DiscriminatorValue("CUSTOMER")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Customer extends User {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membership_id", nullable = false)
    private Membership membership;

    @OneToOne(mappedBy = "customer", fetch = FetchType.LAZY)
    private Cart cart;

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    private List<ProductSubscription> productSubscriptions = new ArrayList<>();

    public Customer(String fullName, String phone, Membership membership) {
        super(fullName, phone);
        assignMembership(membership);
    }

    public void assignMembership(Membership membership) {
        if (membership == null) {
            throw new IllegalArgumentException("membership must not be null");
        }
        if (this.membership == membership) {
            return;
        }
        if (this.membership != null) {
            this.membership.getCustomers().remove(this);
        }
        this.membership = membership;
        if (!membership.getCustomers().contains(this)) {
            membership.getCustomers().add(this);
        }
    }

    public void createCartIfAbsent() {
        if (cart == null) {
            cart = new Cart(this);
        }
    }

}

