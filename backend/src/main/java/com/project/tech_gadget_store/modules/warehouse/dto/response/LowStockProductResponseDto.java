package com.project.tech_gadget_store.modules.warehouse.dto.response;

import lombok.Builder;
import lombok.Getter;



@Getter
@Builder
public class LowStockProductResponseDto {

    private String id;
    private String name;
    private String imageUrl;
    private long stock;
}
