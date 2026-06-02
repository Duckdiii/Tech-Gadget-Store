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

    @OneToOne(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private ImportLog importLog;

    @OneToOne(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private ExportLog exportLog;

    public Staff(String fullName, String phone, String address, String staffCode, LocalDate hireDate) {
        super(fullName, phone, address);
        this.staffCode = staffCode;
        this.hireDate = hireDate;
    }
}
