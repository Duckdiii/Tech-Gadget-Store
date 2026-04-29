package com.project.tech_gadget_store.entity;

import io.r2dbc.postgresql.codec.Json;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("payments")
public class Payment {
    @Id
    private UUID id;
    @Column("order_id")
    private UUID orderId;
    @Column("transaction_id")
    private String transactionId;
    private BigDecimal amount;
    private String gateway;
    @Column("raw_response")
    private Json rawResponse;
    @Column("created_at")
    private OffsetDateTime createdAt;
}
