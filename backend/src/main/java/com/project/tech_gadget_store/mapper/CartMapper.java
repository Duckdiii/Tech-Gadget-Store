package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.dto.response.CartDetailResponseDto;
import com.project.tech_gadget_store.dto.response.CartItemDetailResponseDto;
import com.project.tech_gadget_store.entity.BundleService;
import com.project.tech_gadget_store.entity.Cart;
import com.project.tech_gadget_store.entity.CartItem;
import org.springframework.stereotype.Component;

@Component
public class CartMapper {

    public CartDetailResponseDto toCartDetailResponseDto(Cart cart) {
        if (cart == null) {
            return null;
        }
        return CartDetailResponseDto.builder()
                .cartId(cart.getId())
                .items(cart.getItems() != null ? cart.getItems().stream().map(this::toCartItemDetailResponseDto).toList() : null)
                .total(cart.calculateTotal())
                .build();
    }

    public CartItemDetailResponseDto toCartItemDetailResponseDto(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }
        return CartItemDetailResponseDto.builder()
                .cartItemId(cartItem.getId())
                .productId(cartItem.getProductVariant() != null && cartItem.getProductVariant().getProduct() != null
                        ? cartItem.getProductVariant().getProduct().getId() : null)
                .productName(cartItem.getProductVariant() != null && cartItem.getProductVariant().getProduct() != null
                        ? cartItem.getProductVariant().getProduct().getName() : null)
                .productVariantId(cartItem.getProductVariant() != null ? cartItem.getProductVariant().getId() : null)
                .variantName(cartItem.getProductVariant() != null ? cartItem.getProductVariant().getDisplayName() : null)
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .subtotal(cartItem.calculateSubtotal())
                .bundleServices(cartItem.getBundleServices() != null
                        ? cartItem.getBundleServices().stream().map(this::toBundleServiceResponseDto).toList() : null)
                .build();
    }

    public BundleServiceResponseDto toBundleServiceResponseDto(BundleService bs) {
        if (bs == null) {
            return null;
        }
        return BundleServiceResponseDto.builder()
                .id(bs.getId())
                .createdAt(bs.getCreatedAt())
                .updatedAt(bs.getUpdatedAt())
                .name(bs.getName())
                .type(bs.getType())
                .description(bs.getDescription())
                .price(bs.getPrice())
                .durationMonths(bs.getDurationMonths())
                .active(bs.getActive())
                .build();
    }
}
