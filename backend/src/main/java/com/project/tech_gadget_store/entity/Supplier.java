package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("suppliers")
public class Supplier {
    @Id
    private UUID id;
    @Column("account_id")
    private UUID accountId;
    @Column("company_name")
    private String companyName;
    @Column("contact_person")
    private String contactPerson;
    @Column("phone_number")
    private String phoneNumber;
    @Column("tax_code")
    private String taxCode;
    private String address;
}
