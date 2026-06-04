package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private List<ImportLog> importLogs = new ArrayList<>();

    @OneToMany(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private List<ExportLog> exportLogs = new ArrayList<>();

    public Staff(String fullName, String phone, String staffCode, LocalDate hireDate) {
        super(fullName, phone);
        this.staffCode = staffCode;
        this.hireDate = hireDate;
    }
}
