package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "staffs")
@DiscriminatorValue("STAFF")
@Getter
@Setter
public class Staff extends User {

    @Column(name = "staff_code", nullable = false, unique = true, length = 40)
    private String staffCode;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @OneToOne(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private ImportLog importLog;

    @OneToOne(mappedBy = "performedBy", fetch = FetchType.LAZY)
    private ExportLog exportLog;
}
