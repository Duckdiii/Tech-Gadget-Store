package com.project.tech_gadget_store.dto.request;

import java.util.List;
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
public class CartItemRequestDto {

    private String cartId;
    private String productId;
    private Integer quantity;
    private Boolean selectedForCheckout;
    private List<String> bundleServicesIds;
}
