package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("inventory_ledgers")
public class InventoryLedger {
    public static final String TRANSACTION_IMPORT = "IMPORT";

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

    public static int normalizeQuantityChanged(Integer quantityChanged) {
        if (quantityChanged == null || quantityChanged <= 0) {
            throw new IllegalArgumentException("So luong nhap phai lon hon 0");
        }
        return quantityChanged;
    }

    public static String normalizeNote(String note) {
        return StringUtils.hasText(note) ? note.trim() : null;
    }

    public static InventoryLedger createImportLedger(UUID variantId, Integer quantityChanged, String note, UUID createdBy) {
        int normalizedQuantity = normalizeQuantityChanged(quantityChanged);
        Objects.requireNonNull(variantId, "variantId must not be null");
        Objects.requireNonNull(createdBy, "createdBy must not be null");

        return InventoryLedger.builder()
                .id(UUID.randomUUID())
                .variantId(variantId)
                .transactionType(TRANSACTION_IMPORT)
                .quantityChanged(normalizedQuantity)
                .note(normalizeNote(note))
                .createdBy(createdBy)
                .createdAt(OffsetDateTime.now())
                .build();
    }
}
