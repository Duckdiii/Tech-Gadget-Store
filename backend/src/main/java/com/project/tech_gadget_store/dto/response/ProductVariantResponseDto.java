package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.ProductStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String productId;
    private Integer ramGb;
    private Integer storageGb;
    private String color;
    private BigDecimal price;
    private String sku;
    private ProductStatus status;
    private String inventoryItemId;
    private List<String> importLogItemIds;
    private List<String> exportLogItemIds;
}
