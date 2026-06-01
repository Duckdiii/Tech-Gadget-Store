package com.project.tech_gadget_store.entity;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type")
@Getter
@Setter
public abstract class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    // Quan hệ được map thông qua field user trong class Account
    private List<Account> accounts = new ArrayList<>();
}
