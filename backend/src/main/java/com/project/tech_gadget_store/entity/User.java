package com.project.tech_gadget_store.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 120)
    protected String fullName;

    @Column(name = "phone", length = 20)
    protected String phone;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, optional = false)
    protected Account account;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_address_id")
    private Address defaultAddress;

    protected User(String fullName, String phone) {
        this.fullName = fullName;
        this.phone = phone;
    }

    public void addAddress(Address address) {
        if (address == null) {
            throw new IllegalArgumentException("address must not be null");
        }
        if (address.getUser() != null && address.getUser() != this) {
            address.getUser().getAddresses().remove(address);
        }
        if (!addresses.contains(address)) {
            addresses.add(address);
        }
        address.setUser(this);
    }

    public void removeAddress(Address address) {
        if (address == null) {
            return;
        }
        if (addresses.remove(address)) {
            address.setUser(null);
            if (defaultAddress == address) {
                defaultAddress = null;
            }
        }
    }

    public void changeDefaultAddress(Address address) {
        if (address != null && !addresses.contains(address)) {
            throw new IllegalArgumentException("address does not belong to this user");
        }
        this.defaultAddress = address;
    }
}
