package com.project.tech_gadget_store.modules.catalog.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPageResponseDto {

    private List<ProductResponseDto> items;
    private int page;
    private int size;
    private long totalItems;
    private int totalPages;
}
