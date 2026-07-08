package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "monitors")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Monitor extends Product {

    @Column(name = "screen_size")
    private Double screenSize;

    @Column(name = "resolution", length = 80)
    private String resolution;

    @Column(name = "refresh_rate")
    private Integer refreshRate;

    @Column(name = "panel_type", length = 80)
    private String panelType;

    public Monitor(String name, String description, Brand brand, Category category) {
        super(name, description, brand, category);
    }
}
