package com.project.tech_gadget_store.modules.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "managers")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Manager extends User {

    public Manager(String fullName, String phone) {
        super(fullName, phone);
    }

    @Override
    public String getRoleName() {
        return "MANAGER";
    }
}
