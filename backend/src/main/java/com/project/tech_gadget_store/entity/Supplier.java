package com.project.tech_gadget_store.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Supplier extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String name;

@Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Supplier(String name, String phone, String email, String address) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Supplier name must not be blank");
        }
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
