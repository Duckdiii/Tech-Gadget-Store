package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "managers")
@DiscriminatorValue("MANAGER")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Manager extends User {

    public Manager(String fullName, String phone) {
        super(fullName, phone);
    }

    public boolean canManageStaff() {
        return true;
    }

    public boolean canViewReports() {
        return true;
    }
}
