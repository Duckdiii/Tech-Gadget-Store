package com.project.tech_gadget_store.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatsResponseDto {

    /** Tong san pham dang kinh doanh (is_active = true). */
    private long totalActive;

    /** San pham dang kinh doanh co it nhat mot variant nhung ton kho = 0. */
    private long outOfStock;

    /** San pham dang kinh doanh chua co variant nao. */
    private long noVariants;

    /** San pham dang kinh doanh chua co hinh anh nao. */
    private long noImages;
}