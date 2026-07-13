package com.project.tech_gadget_store.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 1 sản phẩm gợi ý trong "Dành cho bạn", kèm impressionId để frontend báo lại khi khách bấm. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForYouItemDto {
    private String impressionId;
    private ProductResponseDto product;
}
