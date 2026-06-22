package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleProductResponseDto {

    private String id;
    private String name;
    private String brandName;
    private String imageUrl;

    private String variantId;
    private Integer ramGb;
    private Integer storageGb;
    private String color;

    private BigDecimal originalPrice;
    private BigDecimal discountAmount;
    private BigDecimal salePrice;
    private Double discountPercent;

    private String promotionId;
    private String promotionCode;
    private String promotionName;
    private LocalDateTime saleStartAt;
    private LocalDateTime saleEndAt;

    private Integer stockQuantity;
    private Integer soldQuantity;
    private Integer remainingQuantity;
}
