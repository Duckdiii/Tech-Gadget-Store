package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ProductVariant;

import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ProductVariantRepository extends ReactiveCrudRepository<ProductVariant, UUID> {

    Mono<ProductVariant> save(ProductVariant productVariant);

    Mono<ProductVariant> findById(UUID id);

    Flux<ProductVariant> findAllByProductId(UUID productId);

    Flux<ProductVariant> findAllByIsActive(Boolean isActive);

    Mono<ProductVariant> findBySkuCode(String skuCode);

    @Modifying
    @Query("UPDATE product_variants SET quantity = :quantity WHERE id = :variantId")
    Mono<Integer> setStockQuantity(@Param("variantId") UUID variantId,
            @Param("quantity") Integer quantity);

    @Query("""
            SELECT pv.*
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            WHERE p.category_id = :categoryId
              AND p.is_active = TRUE
              AND pv.is_active = TRUE
            """)
    Flux<ProductVariant> findAllActiveByCategoryId(@Param("categoryId") UUID categoryId); // Lấy toàn bộ variant active
                                                                                          // theo category

    @Query("""
            SELECT DISTINCT attr.key AS attributeKey
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            CROSS JOIN LATERAL jsonb_each(COALESCE(pv.attributes::jsonb, '{}'::jsonb)) AS attr(key, value)
            WHERE p.category_id = :categoryId
              AND p.is_active = TRUE
              AND pv.is_active = TRUE
            ORDER BY attr.key
            """)
    Flux<AttributeKeyRow> findDistinctAttributeKeysByCategoryId(@Param("categoryId") UUID categoryId); // Lấy danh sách
                                                                                                       // key có thể lọc
                                                                                                       // (vd: cpu, gpu,
                                                                                                       // ports, ...).

    @Query("""
            SELECT DISTINCT
                CASE
                    WHEN jsonb_typeof(attr.value) = 'array' THEN arr.value
                    ELSE attr.value #>> '{}'
                END AS attributeValue
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            CROSS JOIN LATERAL jsonb_each(COALESCE(pv.attributes::jsonb, '{}'::jsonb)) AS attr(key, value)
            LEFT JOIN LATERAL jsonb_array_elements_text(
                CASE
                    WHEN jsonb_typeof(attr.value) = 'array' THEN attr.value
                    ELSE '[]'::jsonb
                END
            ) AS arr(value) ON TRUE
            WHERE p.category_id = :categoryId
              AND p.is_active = TRUE
              AND pv.is_active = TRUE
              AND attr.key = :attributeKey
              AND (
                    jsonb_typeof(attr.value) <> 'array'
                    OR arr.value IS NOT NULL
              )
            ORDER BY attributeValue
            """)
    Flux<AttributeValueRow> findDistinctAttributeValuesByCategoryAndKey(@Param("categoryId") UUID categoryId,
            @Param("attributeKey") String attributeKey); // Lấy danh sách value theo từng key.

    @Query("""
            SELECT pv.*
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            WHERE p.category_id = :categoryId
              AND p.is_active = TRUE
              AND pv.is_active = TRUE
              AND pv.attributes::jsonb @> CAST(:attributesFilterJson AS jsonb)
            """)
    Flux<ProductVariant> findAllByCategoryIdAndAttributesFilter(@Param("categoryId") UUID categoryId,
            @Param("attributesFilterJson") String attributesFilterJson); // Lọc variant theo JSON filter bằng toán tử
                                                                         // @> của PostgreSQL.

    interface AttributeKeyRow {
        String getAttributeKey();
    }

    interface AttributeValueRow {
        String getAttributeValue();
    }
}
