package com.project.tech_gadget_store.modules.auth.dto.response;

import java.time.LocalDateTime;
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
public class PurchasedProductDto {
    private String productId;
    private String productName;
    private String productImageUrl;
    private String variantName;
    private Integer quantity;
    private LocalDateTime lastPurchaseDate;
}
