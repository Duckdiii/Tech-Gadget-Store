package com.project.tech_gadget_store.modules.catalog.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandRevenueDto {
    private String brandId;
    private String brandName;
    private BigDecimal revenue;
}
