package com.project.tech_gadget_store.modules.catalog.dto.response;

import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NlSearchResponseDto {

    /** Bộ lọc có cấu trúc mà model đã suy ra từ câu tìm kiếm tự nhiên — trả về để FE hiển thị
     * minh bạch cho khách biết hệ thống đã hiểu câu hỏi như thế nào. */
    private ProductFilterRequestDto interpretedFilter;

    private ProductPageResponseDto results;
}
