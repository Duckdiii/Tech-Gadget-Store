package com.project.tech_gadget_store.modules.auth.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.notification.entity.Notification;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
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

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false)
    private List<Address> addresses = new ArrayList<>();

    protected User(String fullName, String phone) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("fullName must not be blank");
        }
        this.fullName = fullName;
        this.phone = phone;
    }

    public void updateProfile(String fullName, String phone, Address address) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("fullName must not be blank");
        }
        this.fullName = fullName;
        changePhone(phone);
        changeAddress(address);
    }

    public void changePhone(String phone) {
        this.phone = phone;
    }

    public void changeAddress(Address newAddress) {
        if (newAddress == null) {
            throw new IllegalArgumentException("address must not be null");
        }
        if (addresses.isEmpty()) {
            addresses.add(newAddress);
            return;
        }
        addresses.set(0, newAddress);
    }

    public String getDisplayName() {
        if (fullName != null && !fullName.isBlank()) {
            return fullName;
        }
        if (account != null && account.getEmail() != null && !account.getEmail().isBlank()) {
            return account.getEmail();
        }
        return getId();
    }

    public void removeAddress(Address address) {
        if (addresses.size() <= 1) {
            throw new IllegalStateException("user must have at least one address");
        }
        addresses.remove(address);
    }

    /**
     * Short role code ("MANAGER"/"STAFF"/"CUSTOMER") used for JWT authorities, audit logs and
     * profile responses. A virtual call — even through a lazy Hibernate proxy of this abstract
     * type — dispatches to the concrete subclass's override, so callers never need an
     * {@code instanceof}/unproxy check to find out which kind of user this is.
     */
    public abstract String getRoleName();
}
