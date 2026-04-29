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
@Table("reviews")
public class Review {
    @Id
    private UUID id;
    @Column("product_id")
    private UUID productId;
    @Column("customer_id")
    private UUID customerId;
    private Integer rating;
    private String comment;
    @Column("created_at")
    private OffsetDateTime createdAt;
}
