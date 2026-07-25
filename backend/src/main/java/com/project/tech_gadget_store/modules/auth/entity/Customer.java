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

    @Setter(AccessLevel.NONE)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membership_id", nullable = false)
    private Membership membership;

    @OneToOne(mappedBy = "customer", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    private Cart cart;

    // Loại cổng thanh toán khách chọn làm mặc định cho lần thanh toán sau (vd. "MOMO"/"VNPAY"/"COD").
    // Không lưu bất kỳ thông tin thẻ/tài khoản nào — chỉ tham chiếu tới PaymentMethod hệ thống đã cấu hình sẵn.
    @Column(name = "preferred_payment_type", length = 20)
    private String preferredPaymentType;



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

    /**
     * Raw field assignment used only by {@link Membership#addCustomer}/
     * {@link Membership#removeCustomer} (they live in a different package and already own
     * updating their side — the {@code customers} list — of this relationship). Application code
     * must go through {@link #assignMembership(Membership)} instead — it also keeps the old and
     * new membership's customer lists in sync, which this method does not.
     */
    public void applyMembership(Membership membership) {
        this.membership = membership;
    }

    @Override
    public String getRoleName() {
        return "CUSTOMER";
    }

}
