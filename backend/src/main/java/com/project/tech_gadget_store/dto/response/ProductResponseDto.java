package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {

    private String id;
    private String name;
    private String brandName;
    private BigDecimal minPrice;
    private String imageUrl;
    private Integer ramGb;
    private Integer storageGb;
    private String color;
    private boolean hasVariants;
}
