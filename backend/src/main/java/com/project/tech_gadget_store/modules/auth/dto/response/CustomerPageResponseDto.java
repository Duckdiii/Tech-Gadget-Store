package com.project.tech_gadget_store.modules.auth.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPageResponseDto {
    private List<CustomerSummaryDto> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
