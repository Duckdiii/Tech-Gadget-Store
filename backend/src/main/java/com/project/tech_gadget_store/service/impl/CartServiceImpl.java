package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.AddToCartRequest;
import com.project.tech_gadget_store.dto.response.CartItemResponse;
import com.project.tech_gadget_store.dto.response.CartResponse;
import com.project.tech_gadget_store.entity.Cart;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.OrderItem;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.repository.OrderItemRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository variantRepository;

    @Override
    public Mono<CartResponse> getMyCart(UUID accountId) {
        return findPendingOrder(accountId)
                .flatMap(this::buildCartResponse);
    }

    @Override
    public Mono<CartResponse> addToCart(UUID accountId, AddToCartRequest request) {
        int requestedQuantity = Cart.normalizeQuantity(request.getQuantity());

        return variantRepository.findById(request.getVariantId())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Khong tim thay san pham")))
                .flatMap(variant -> {
                    Cart.validateStock(variant, requestedQuantity);
                    return findPendingOrder(accountId)
                            .switchIfEmpty(Mono.defer(() -> orderRepository.save(Cart.createPendingOrder(accountId))))
                            .flatMap(order -> orderItemRepository
                                    .save(Cart.createOrderItem(order.getId(), request.getVariantId(), requestedQuantity,
                                            variant.getPrice()))
                                    .then(buildCartResponse(order)));
                });
    }

    @Override
    public Mono<CartResponse> updateItemQuantity(UUID accountId, UUID orderItemId, int quantity) {
        int requestedQuantity = Cart.normalizeQuantity(quantity);

        return findPendingOrder(accountId)
                .flatMap(order -> orderItemRepository.findById(orderItemId)
                        .switchIfEmpty(Mono.error(new IllegalArgumentException("Khong tim thay san pham trong gio")))
                        .flatMap(item -> {
                            Cart.validateItemOwnership(item, order.getId());
                            return variantRepository.findById(item.getVariantId())
                                    .switchIfEmpty(Mono.error(new IllegalArgumentException("Khong tim thay san pham")))
                                    .flatMap(variant -> {
                                        Cart.validateStock(variant, requestedQuantity);
                                        Cart.updateItem(item, requestedQuantity, variant.getPrice());
                                        return orderItemRepository.save(item).then(buildCartResponse(order));
                                    });
                        }));
    }

    @Override
    public Mono<CartResponse> removeItemFromCart(UUID accountId, UUID orderItemId) {
        return findPendingOrder(accountId)
                .flatMap(order -> orderItemRepository.findById(orderItemId)
                        .switchIfEmpty(Mono.error(new IllegalArgumentException("Khong tim thay san pham trong gio")))
                        .flatMap(item -> {
                            Cart.validateItemOwnership(item, order.getId());
                            return orderItemRepository.delete(item).then(buildCartResponse(order));
                        }));
    }

    @Override
    public Mono<Void> clearCart(UUID accountId) {
        return findPendingOrder(accountId)
                .flatMap(order -> orderItemRepository.findAllByOrderId(order.getId())
                        .flatMap(orderItemRepository::delete)
                        .then(orderRepository.delete(order)));
    }

    private Mono<Order> findPendingOrder(UUID accountId) {
        return orderRepository.findAllByAccountId(accountId)
                .filter(Cart::isPendingOrder)
                .next();
    }

    private Mono<CartResponse> buildCartResponse(Order order) {
        return orderItemRepository.findAllByOrderId(order.getId())
                .collectList()
                .flatMap(items -> mapVariants(items)
                        .map(variantsById -> toCartResponse(order, items, variantsById)));
    }

    private Mono<Map<UUID, ProductVariant>> mapVariants(List<OrderItem> items) {
        return Flux.fromIterable(items)
                .flatMap(item -> variantRepository.findById(item.getVariantId())
                        .switchIfEmpty(Mono.error(new IllegalArgumentException("Khong tim thay san pham"))))
                .collectMap(ProductVariant::getId, Function.identity());
    }

    private CartResponse toCartResponse(Order order, List<OrderItem> items, Map<UUID, ProductVariant> variantsById) {
        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> {
                    ProductVariant variant = variantsById.get(item.getVariantId());
                    return new CartItemResponse(
                            item.getId(),
                            item.getVariantId(),
                            variant.getVariantName(),
                            variant.getVariantName(),
                            variant.getImageUrl(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            Cart.lineSubtotal(item));
                })
                .collect(Collectors.toList());

        BigDecimal subtotal = Cart.subtotal(items);
        BigDecimal discountAmount = Cart.safeAmount(order.getDiscountAmount());
        BigDecimal shippingFee = Cart.safeAmount(order.getShippingFee());
        BigDecimal totalAmount = order.getTotalAmount() == null
                ? subtotal.subtract(discountAmount).add(shippingFee)
                : order.getTotalAmount();

        return new CartResponse(
                order.getId(),
                itemResponses,
                subtotal,
                discountAmount,
                shippingFee,
                totalAmount,
                order.getOrderStatus(),
                order.getPaymentStatus());
    }
}
