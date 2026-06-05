package com.project.tech_gadget_store.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String cartId;
    private String productVariantId;
    private Integer quantity;
    private Boolean isSelectedForCheckout;
    private List<String> bundleServicesIds;
}
