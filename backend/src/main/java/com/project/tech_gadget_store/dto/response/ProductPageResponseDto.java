package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

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
