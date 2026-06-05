package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "phone_specifications")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PhoneSpecification extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

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

    public PhoneSpecification(Product product) {
        product.assignSpec(this);
    }
}
