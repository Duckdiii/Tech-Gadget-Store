package com.project.tech_gadget_store.dto.request;

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
public class WarehouseLogFilterRequestDto {
    private String type;         // "IMPORT", "EXPORT", or null
    private String keyword;      // Product name keyword
    private String startDate;    // yyyy-MM-dd
    private String endDate;      // yyyy-MM-dd
    private String performedBy;
    private String status;
}
