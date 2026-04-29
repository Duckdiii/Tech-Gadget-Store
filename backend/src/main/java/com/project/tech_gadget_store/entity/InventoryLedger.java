package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("inventory_ledgers")
public class InventoryLedger {
    @Id
    private UUID id;
    @Column("variant_id")
    private UUID variantId;
    @Column("transaction_type")
    private String transactionType;
    @Column("quantity_changed")
    private Integer quantityChanged;
    @Column("reference_id")
    private UUID referenceId;
    private String note;
    @Column("created_by")
    private UUID createdBy;
    @Column("created_at")
    private OffsetDateTime createdAt;
}
