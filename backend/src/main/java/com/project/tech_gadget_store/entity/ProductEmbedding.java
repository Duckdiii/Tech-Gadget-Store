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
@Table("product_embeddings")
public class ProductEmbedding {
    @Id
    private UUID id;
    @Column("product_id")
    private UUID productId;
    private String content;
    private float[] embedding;
    @Column("created_at")
    private OffsetDateTime createdAt;
}
