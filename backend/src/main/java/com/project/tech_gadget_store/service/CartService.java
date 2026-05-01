package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.AddToCartRequest;
import com.project.tech_gadget_store.dto.response.CartResponse;

import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CartService {
    // 1. Xem giỏ hàng hiện tại
    Mono<CartResponse> getMyCart(UUID accountId);

    // 2. Thêm sản phẩm vào giỏ
    Mono<CartResponse> addToCart(UUID accountId, AddToCartRequest request);

    // 3. Cập nhật số lượng (dành cho nút [+] và [-] trên UI)
    Mono<CartResponse> updateItemQuantity(UUID accountId, UUID orderItemId, int quantity);

    // 4. Xóa một sản phẩm khỏi giỏ (Nút thùng rác)
    Mono<CartResponse> removeItemFromCart(UUID accountId, UUID orderItemId);

    // 5. Làm sạch giỏ hàng (Hủy đơn nháp)
    Mono<Void> clearCart(UUID accountId);

}
