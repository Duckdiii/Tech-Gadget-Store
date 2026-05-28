package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.entity.enums.PaymentStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class Cart {

    private Cart() {
    }

    public static boolean isPendingOrder(Order order) {
        return OrderStatus.PENDING.name().equals(order.getOrderStatus());
    }

    public static Order createPendingOrder(UUID accountId) {
        Order order = new Order();
        order.assignAccount(accountId);
        order.changeStatus(OrderStatus.PENDING.name());
        order.changePaymentStatus(PaymentStatus.PENDING.name());
        order.applyPriceSummary(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        return order;
    }

    public static int normalizeQuantity(Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("So luong phai lon hon 0");
        }
        return quantity;
    }

    public static void validateStock(ProductVariant variant, int requiredQuantity) {
        Integer stockQuantity = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        if (stockQuantity < requiredQuantity) {
            throw new IllegalStateException("Khong du hang trong kho");
        }
    }

    public static OrderItem createOrderItem(UUID orderId, UUID variantId, int quantity, BigDecimal unitPrice) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrderId(orderId);
        orderItem.setVariantId(variantId);
        orderItem.setQuantity(quantity);
        orderItem.setUnitPrice(unitPrice);
        return orderItem;
    }

    public static void validateItemOwnership(OrderItem item, UUID orderId) {
        if (!item.getOrderId().equals(orderId)) {
            throw new IllegalArgumentException("Order item khong thuoc ve don hang cua user");
        }
    }

    public static void updateItem(OrderItem item, int quantity, BigDecimal unitPrice) {
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
    }

    public static BigDecimal lineSubtotal(OrderItem item) {
        return item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    public static BigDecimal subtotal(List<OrderItem> items) {
        return items.stream()
                .map(Cart::lineSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static BigDecimal safeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    public static BigDecimal resolveTotalAmount(Order order, List<OrderItem> items) {
        BigDecimal subtotal = subtotal(items);
        BigDecimal discountAmount = safeAmount(order.getDiscountAmount());
        BigDecimal shippingFee = safeAmount(order.getShippingFee());
        return order.getTotalAmount() == null
                ? subtotal.subtract(discountAmount).add(shippingFee)
                : order.getTotalAmount();
    }
}
