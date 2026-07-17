package com.project.tech_gadget_store.modules.settings.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/**
 * Singleton store-wide configuration — "Cấu hình hệ thống" > "Thông tin chung" on the manager
 * page. Always exactly one row; see StoreSettingsService.getOrCreateSettings() for the
 * self-healing lazy-init (no seeder/migration needed for the default row).
 */
@Entity
@Table(name = "store_settings")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoreSettings extends BaseEntity {

    @Column(name = "store_name", nullable = false, length = 150)
    private String storeName;

    @Column(name = "contact_email", nullable = false, length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "allow_product_reviews", nullable = false)
    private boolean allowProductReviews = true;

    public StoreSettings(String storeName, String contactEmail, String contactPhone, String address,
            boolean allowProductReviews) {
        this.storeName = storeName;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.address = address;
        this.allowProductReviews = allowProductReviews;
    }
}
