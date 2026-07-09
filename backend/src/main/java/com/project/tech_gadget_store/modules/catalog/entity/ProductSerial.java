package com.project.tech_gadget_store.modules.catalog.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_serials", uniqueConstraints = @UniqueConstraint(name = "uk_product_serials_number", columnNames = "serial_number"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSerial extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SerialStatus status;

    @Column(name = "import_item_id", length = 36)
    private String importItemId;

    @Column(name = "invoice_item_id", length = 36)
    private String invoiceItemId;
}
