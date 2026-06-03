package com.project.tech_gadget_store.dto.request;

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
public class ImportLogItemRequestDto {

    private String productVariantId;
    private Integer quantity;
    private BigDecimal importPrice;
}
