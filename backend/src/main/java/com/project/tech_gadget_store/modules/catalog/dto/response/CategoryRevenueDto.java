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
public class CategoryRevenueDto {
    private String categoryId;
    private String categoryName;
    private BigDecimal revenue;
}
