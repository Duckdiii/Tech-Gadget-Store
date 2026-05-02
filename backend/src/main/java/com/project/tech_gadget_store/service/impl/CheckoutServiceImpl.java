package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.config.MoMoConfig;
import com.project.tech_gadget_store.config.PaymentGatewayConfig;
import com.project.tech_gadget_store.config.VnPayConfig;
import com.project.tech_gadget_store.dto.request.CheckoutRequest;
import com.project.tech_gadget_store.dto.response.CheckoutResponse;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.entity.enums.PaymentStatus;
import com.project.tech_gadget_store.exception.ConflictException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.OrderItemRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.service.CheckoutService;
import com.project.tech_gadget_store.service.event.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository variantRepository;
    private final VnPayConfig vnPayConfig;
    private final MoMoConfig moMoConfig;
    private final PaymentGatewayConfig paymentGatewayConfig;
    private final OrderEventPublisher orderEventPublisher;

    @Override
    public Mono<CheckoutResponse> processCheckout(UUID accountId, CheckoutRequest request) {
        return orderRepository.findById(request.getOrderId()) // Lấy đơn hàng theo ID từ request
                .filter(order -> accountId.equals(order.getAccountId())) // Kiểm tra đơn hàng thuộc về user đang
                                                                         // checkout
                .filter(order -> OrderStatus.PENDING.name().equals(order.getOrderStatus())) // Chỉ xử lý đơn hàng có
                                                                                            // trạng thái PENDING
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Khong tim thay gio hang hop le"))) // Nếu không
                                                                                                            // tìm thấy
                                                                                                            // đơn hàng
                                                                                                            // hợp lệ,
                                                                                                            // trả về
                                                                                                            // lỗi
                .flatMap(this::validateAndLockInventory)// Kiem tra ton kho va khoa hang
                .flatMap(order -> finalizeCheckout(order, request)) // Cap nhat trang thai don hang, thong tin thanh toan, dia chi giao hang
                .doOnNext(orderEventPublisher::publishOrderCreated)
                .map(savedOrder -> {
                    String paymentUrl = buildPaymentUrl(savedOrder.getTotalAmount(), request.getPaymentMethod());
                    return new CheckoutResponse(
                            savedOrder.getId(),
                            savedOrder.getOrderStatus(),
                            savedOrder.getPaymentStatus(),
                            savedOrder.getTotalAmount(),
                            paymentUrl);
                });
    }

    private Mono<Order> validateAndLockInventory(Order order) { // Kiểm tra tồn kho và khóa hàng
        return orderItemRepository.findAllByOrderId(order.getId()) // Lấy tất cả item trong đơn hàng
                .collectList() // Chuyển Flux<OrderItem> thành Mono<List<OrderItem>> để dễ xử lý
                .flatMap(items -> {
                    if (items.isEmpty()) {
                        return Mono.error(new ConflictException("Gio hang cua ban dang trong"));
                    }

                    return Flux.fromIterable(items)
                            .flatMap(item -> variantRepository.findById(item.getVariantId())
                                    .switchIfEmpty(Mono.error(new ResourceNotFoundException(
                                            "Khong tim thay bien the san pham: " + item.getVariantId())))
                                    .flatMap(variant -> {
                                        int stock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
                                        int locked = variant.getLockedQuantity() == null ? 0
                                                : variant.getLockedQuantity();
                                        int quantity = item.getQuantity() == null ? 0 : item.getQuantity(); // Số lượng
                                                                                                            // cần đặt

                                        //
                                        if (quantity <= 0) {
                                            return Mono.error(new ConflictException("So luong san pham khong hop le"));
                                        }

                                        if (stock < quantity) {
                                            return Mono.error(new ConflictException(
                                                    "San pham " + variant.getVariantName()
                                                            + " khong du so luong trong kho"));
                                        }

                                        variant.setStockQuantity(stock - quantity);
                                        variant.setLockedQuantity(locked + quantity);
                                        return variantRepository.save(variant).then();
                                    }))
                            .then(Mono.just(order));
                });
    }

    private Mono<Order> finalizeCheckout(Order order, CheckoutRequest request) { // Cập nhật trạng thái đơn hàng, thông
                                                                                 // tin thanh toán, địa chỉ giao hàng
        order.setShippingAddressSnapshot(request.getShippingAddress());
        order.setPaymentMethod(normalizePaymentMethod(request.getPaymentMethod()));
        order.setPaymentStatus(PaymentStatus.PENDING.name());
        order.setOrderStatus(OrderStatus.PENDING.name());
        order.setUpdatedAt(OffsetDateTime.now());

        return orderRepository.save(order);
    }

    private String normalizePaymentMethod(String paymentMethod) {
        return paymentMethod == null ? null : paymentMethod.trim().toUpperCase(Locale.ROOT);
    }

    private String buildPaymentUrl(java.math.BigDecimal totalAmount, String paymentMethod) {
        if (paymentMethod == null) {
            return null;
        }

        boolean sandboxMode = paymentGatewayConfig.isDefaultSandboxMode();

        if ("VNPAY".equalsIgnoreCase(paymentMethod)) {
            VnPayConfig.GatewayProfile profile = vnPayConfig.getActiveProfile(sandboxMode);
            return profile.getEndpoint() + "?vnp_Amount=" + totalAmount;
        }

        if ("MOMO".equalsIgnoreCase(paymentMethod)) {
            MoMoConfig.GatewayProfile profile = moMoConfig.getActiveProfile(sandboxMode);
            return profile.getEndpoint() + "?amount=" + totalAmount;
        }

        return null;
    }
}


