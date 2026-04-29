package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("employees")
public class Employee {
    @Id
    private UUID id;
    @Column("account_id")
    private UUID accountId;
    @Column("employee_code")
    private String employeeCode;
    @Column("full_name")
    private String fullName;
    private String department;
    @Column("hire_date")
    private LocalDate hireDate;
    @Column("salary_base")
    private BigDecimal salaryBase;
}
