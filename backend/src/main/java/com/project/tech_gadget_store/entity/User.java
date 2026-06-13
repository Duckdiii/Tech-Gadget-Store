package com.project.tech_gadget_store.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
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

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Address> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private List<ImportLog> importLogs = new ArrayList<>();

    @OneToMany(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private List<ExportLog> exportLogs = new ArrayList<>();

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
}
