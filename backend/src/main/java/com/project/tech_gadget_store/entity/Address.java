package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Address extends BaseEntity {

    @Column(name = "street", length = 255)
    private String street;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "province", length = 100)
    private String province;

    public Address(String street, String ward, String district, String province) {
        if (street == null || street.isBlank()) {
            throw new IllegalArgumentException("street must not be blank");
        }
        if (ward == null || ward.isBlank()) {
            throw new IllegalArgumentException("ward must not be blank");
        }
        if (district == null || district.isBlank()) {
            throw new IllegalArgumentException("district must not be blank");
        }
        if (province == null || province.isBlank()) {
            throw new IllegalArgumentException("province must not be blank");
        }
        this.street = street;
        this.ward = ward;
        this.district = district;
        this.province = province;
    }
}
