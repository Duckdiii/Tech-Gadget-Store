package com.project.tech_gadget_store.modules.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Read-only mirror of the ml-service's {@code customer_recommendation_cache} table — the
 * batch-computed top-N Matrix Factorization recommendations for each customer. Written
 * exclusively by {@code ml-service/generate_recommendations.py} (Python, offline); Spring
 * Boot only ever reads it. Does not extend {@link com.project.tech_gadget_store.common.entity.BaseEntity}
 * since it has a natural composite key (customerId, rank), not a generated UUID.
 */
@Entity
@Table(name = "customer_recommendation_cache")
@IdClass(CustomerRecommendationCacheId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerRecommendationCache {

    @Id
    @Column(name = "customer_id", length = 36)
    private String customerId;

    @Id
    @Column(name = "rank")
    private Integer rank;

    @Column(name = "product_id", length = 36, nullable = false)
    private String productId;

    @Column(name = "score")
    private Double score;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;
}
