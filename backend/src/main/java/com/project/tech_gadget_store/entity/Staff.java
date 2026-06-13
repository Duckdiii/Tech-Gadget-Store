package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "staffs")
@DiscriminatorValue("STAFF")
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
