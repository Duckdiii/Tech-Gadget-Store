package com.project.tech_gadget_store.modules.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "phones")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Phone extends Product {

    @Column(name = "screen_size")
    private Double screenSize;

    @Column(name = "rear_camera", length = 255)
    private String rearCamera;

    @Column(name = "front_camera", length = 255)
    private String frontCamera;

    @Column(name = "chipset", length = 120)
    private String chipset;

    @Column(name = "nfc_supported")
    private Boolean nfcSupported;

    @Column(name = "battery_capacity")
    private Integer batteryCapacity;

    @Column(name = "sim_type", length = 100)
    private String simType;

    @Column(name = "operating_system", length = 120)
    private String operatingSystem;

    @Column(name = "screen_resolution", length = 120)
    private String screenResolution;

    public Phone(String name, String description, Brand brand, Category category) {
        super(name, description, brand, category);
    }
}
