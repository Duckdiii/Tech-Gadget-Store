package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.ProductStatus;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequestDto {

    private String productId;
    private Integer ramGb;
    private Integer storageGb;
    private String color;
    private BigDecimal price;
    private String sku;
    private ProductStatus status;
}
