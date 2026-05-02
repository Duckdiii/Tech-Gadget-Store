package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.AddToCartRequest;
import com.project.tech_gadget_store.dto.response.CartItemResponse;
import com.project.tech_gadget_store.dto.response.CartResponse;
import com.project.tech_gadget_store.dto.response.CheckoutResponse;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.OrderItem;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.entity.enums.PaymentStatus;
import com.project.tech_gadget_store.repository.OrderItemRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.service.CartService;

import reactor.core.publisher.Mono;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Lombok sẽ tự động tạo constructor với tất cả các trường final (repository) để
                         // Spring có thể inject
public class CartServiceImpl implements CartService {
        private final OrderRepository orderRepository;
        private final OrderItemRepository orderItemRepository;
        private final ProductVariantRepository variantRepository;

        // 1. Xem giỏ hàng hiện tại
        public Mono<CartResponse> getMyCart(UUID accountId) {
                return orderRepository.findAllByAccountId(accountId)
                                .filter(order -> OrderStatus.PENDING.name().equals(order.getOrderStatus()))
                                .next()
                                .flatMap(order -> orderItemRepository.findAllByOrderId(order.getId())
                                                .collectList()
                                                .map(items -> {
                                                        List<CartItemResponse> itemResponses = items.stream()
                                                                        .map(item -> {
                                                                                ProductVariant variant = variantRepository
                                                                                                .findById(item.getVariantId())
                                                                                                .block();
                                                                                return new CartItemResponse(
                                                                                                item.getId(),
                                                                                                item.getVariantId(),
                                                                                                variant.getVariantName(),
                                                                                                variant.getVariantName(),
                                                                                                variant.getImageUrl(),
                                                                                                item.getQuantity(),
                                                                                                item.getUnitPrice(),
                                                                                                item.getUnitPrice()
                                                                                                                .multiply(BigDecimal
                                                                                                                                .valueOf(item.getQuantity())));
                                                                        })
                                                                        .collect(Collectors.toList());
                                                        BigDecimal subtotal = items.stream()
                                                                        .map(item -> item.getUnitPrice().multiply(
                                                                                        BigDecimal.valueOf(item
                                                                                                        .getQuantity())))
                                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                                        return new CartResponse(
                                                                        order.getId(),
                                                                        itemResponses,
                                                                        subtotal,
                                                                        order.getDiscountAmount(),
                                                                        order.getShippingFee(),
                                                                        order.getTotalAmount(),
                                                                        order.getOrderStatus(),
                                                                        order.getPaymentStatus());
                                                }));

        }

        // 2. Thêm sản phẩm vào giỏ
        public Mono<CartResponse> addToCart(UUID accountId, AddToCartRequest request) {
                return variantRepository.findById(request.getVariantId())
                                .flatMap(variant -> {
                                        if (variant.getStockQuantity() < 1) {
                                                return Mono.error(new IllegalStateException("Sản phẩm đã hết hàng"));
                                        }
                                        return orderRepository.findAllByAccountId(accountId) // Lấy đơn hàng hiện tại
                                                                                             // của user
                                                        .filter(order -> OrderStatus.PENDING.name()
                                                                        .equals(order.getOrderStatus())) // Chỉ lấy đơn
                                                                                                         // hàng có
                                                                                                         // trạng
                                                                                                         // thái PENDING
                                                                                                         // (đang chờ
                                                                                                         // thanh toán)
                                                        .next()// Nếu có đơn hàng PENDING, sử dụng đơn đó, nếu không có
                                                               // thì tạo mới một đơn
                                                               // hàng mới
                                                        .switchIfEmpty(Mono.defer(() -> {
                                                                Order newOrder = new Order();
                                                                newOrder.setAccountId(accountId);
                                                                newOrder.setOrderStatus(OrderStatus.PENDING.name());
                                                                newOrder.setPaymentStatus(PaymentStatus.PENDING.name());
                                                                return orderRepository.save(newOrder);
                                                        }))
                                                        .flatMap(order -> {
                                                                OrderItem orderItem = new OrderItem();
                                                                orderItem.setOrderId(order.getId());
                                                                orderItem.setVariantId(request.getVariantId());
                                                                orderItem.setQuantity(1);
                                                                orderItem.setUnitPrice(variant.getPrice());
                                                                return orderItemRepository.save(orderItem)
                                                                                .thenReturn(order.getId());
                                                        })
                                                        .flatMap(this::getMyCart);
                                });

        }

        // 3. Cập nhật số lượng (dành cho nút [+] và [-] trên UI)
        public Mono<CartResponse> updateItemQuantity(UUID accountId, UUID orderItemId, int quantity) {
                return orderRepository.findAllByAccountId(accountId)
                                .filter(order -> OrderStatus.PENDING.name().equals(order.getOrderStatus()))
                                .next()
                                .flatMap(order -> orderItemRepository.findById(orderItemId)
                                                .flatMap(item -> {
                                                        if (!item.getOrderId().equals(order.getId())) {
                                                                return Mono.error(
                                                                                new IllegalArgumentException(
                                                                                                "Order item không thuộc về đơn hàng của user"));
                                                        }
                                                        if (quantity < 1) {
                                                                return Mono.error(new IllegalArgumentException(
                                                                                "Số lượng phải lớn hơn 0"));
                                                        }
                                                        return variantRepository.findById(item.getVariantId())
                                                                        .flatMap(variant -> {
                                                                                if (variant.getStockQuantity() < quantity) {
                                                                                        return Mono.error(
                                                                                                        new IllegalStateException(
                                                                                                                        "Không đủ hàng trong kho"));
                                                                                }
                                                                                item.setQuantity(quantity);
                                                                                item.setUnitPrice(variant.getPrice());
                                                                                return orderItemRepository.save(item)
                                                                                                .thenReturn(order
                                                                                                                .getId());
                                                                        });
                                                }))
                                .flatMap(this::getMyCart); // Sau khi cập nhật số lượng, trả về thông tin giỏ hàng mới
                                                           // nhất để UI có thể
                                                           // cập nhật lại

        }

        // 4. Xóa một sản phẩm khỏi giỏ (Nút thùng rác)
        public Mono<CartResponse> removeItemFromCart(UUID accountId, UUID orderItemId) {
                return orderRepository.findAllByAccountId(accountId)
                                .filter(order -> OrderStatus.PENDING.name().equals(order.getOrderStatus()))
                                .next()
                                .flatMap(order -> orderItemRepository.findById(orderItemId)
                                                .flatMap(item -> {
                                                        if (!item.getOrderId().equals(order.getId())) {
                                                                return Mono.error(
                                                                                new IllegalArgumentException(
                                                                                                "Order item không thuộc về đơn hàng của user"));
                                                        }
                                                        return orderItemRepository.delete(item)
                                                                        .thenReturn(order.getId());
                                                }))
                                .flatMap(this::getMyCart); // Sau khi xóa item, trả về thông tin giỏ hàng mới nhất để UI
                                                           // có thể cập nhật
                                                           // lại

        }

        // 5. Làm sạch giỏ hàng (Hủy đơn nháp)
        public Mono<Void> clearCart(UUID accountId) {
                return orderRepository.findAllByAccountId(accountId)
                                .filter(order -> OrderStatus.PENDING.name().equals(order.getOrderStatus()))
                                .next()
                                .flatMap(order -> orderItemRepository.findAllByOrderId(order.getId())
                                                .flatMap(orderItemRepository::delete)
                                                .then(orderRepository.delete(order)));

        }
}
