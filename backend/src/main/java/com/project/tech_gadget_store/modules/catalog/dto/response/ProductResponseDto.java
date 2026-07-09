package com.project.tech_gadget_store.modules.catalog.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Getter
@Builder // lombok
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {

    private String id;
    private String name;
    private String brandName;
    private String categoryName;
    private BigDecimal minPrice;
    private String imageUrl;
    private Integer ramGb;
    private Integer storageGb;
    private String color;
    private boolean hasVariants;
}
