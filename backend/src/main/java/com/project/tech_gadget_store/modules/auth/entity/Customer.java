package com.project.tech_gadget_store.modules.auth.entity;

import com.project.tech_gadget_store.modules.catalog.entity.FavoriteProduct;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.order.entity.Cart;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "customers")
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
    private List<FavoriteProduct> favoriteProducts = new ArrayList<>();

    public Customer(String fullName, String phone, Membership membership) {
        super(fullName, phone);
        if (membership == null) {
            throw new IllegalArgumentException("membership must not be null");
        }

        assignMembership(membership);
    }

    public void createCartIfAbsent() {
        if (cart == null) {
            cart = new Cart(this);
        }
    }

    public void assignMembership(Membership membership) {
        if (membership == null) {
            throw new IllegalArgumentException("membership must not be null");
        }
        // so sánh theo id để tránh false-negative khi JPA dùng proxy khác nhau
        if (this.membership != null && this.membership.getId() != null
                && this.membership.getId().equals(membership.getId())) {
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

}
