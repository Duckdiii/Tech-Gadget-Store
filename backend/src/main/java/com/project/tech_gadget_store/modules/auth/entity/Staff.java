package com.project.tech_gadget_store.modules.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "staffs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Staff extends User {

    @Column(name = "staff_code", nullable = false, unique = true, length = 40)
    private String staffCode;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    public Staff(String fullName, String phone, String staffCode, LocalDate hireDate) {
        super(fullName, phone);
        if (staffCode == null || staffCode.isBlank()) {
            throw new IllegalArgumentException("staffCode must not be blank");
        }
        this.staffCode = staffCode;
        this.hireDate = hireDate;
    }

    public boolean canManageInventory() {
        return true;
    }
}
