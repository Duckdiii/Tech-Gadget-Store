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
public class ProductRequestDto {

    private String name;
    private String description;
    private BigDecimal price;
    private ProductStatus status;
    private String brandId;
    private String categoryId;
}
