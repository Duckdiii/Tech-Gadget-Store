package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("shipments")
public class Shipment {
    @Id
    private UUID id;
    @Column("order_id")
    private UUID orderId;
    @Column("tracking_code")
    private String trackingCode;
    @Column("carrier_name")
    private String carrierName;
    private String status;
    @Column("estimated_delivery")
    private LocalDate estimatedDelivery;
    @Column("updated_at")
    private OffsetDateTime updatedAt;
}
