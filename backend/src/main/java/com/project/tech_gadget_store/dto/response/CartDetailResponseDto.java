package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDetailResponseDto {

    private String cartId;
    private List<CartItemDetailResponseDto> items;
    private BigDecimal total;
}
