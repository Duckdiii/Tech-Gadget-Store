package com.project.tech_gadget_store.modules.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "laptops")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Laptop extends Product {

    @Column(name = "cpu", length = 120)
    private String cpu;

    @Column(name = "gpu", length = 120)
    private String gpu;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "screen_size")
    private Double screenSize;

    @Column(name = "operating_system", length = 120)
    private String operatingSystem;

    public Laptop(String name, String description, Brand brand, Category category) {
        super(name, description, brand, category);
    }
}
