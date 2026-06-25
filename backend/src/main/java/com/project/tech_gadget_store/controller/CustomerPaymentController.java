package com.project.tech_gadget_store.controller;

import tools.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.dto.response.CheckoutItemResponseDto;
import com.project.tech_gadget_store.dto.response.CheckoutSummaryResponseDto;
import com.project.tech_gadget_store.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.dto.response.PaymentMethodResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.repository.*;
import com.project.tech_gadget_store.service.MomoService;
import com.project.tech_gadget_store.service.PaymentService;
import com.project.tech_gadget_store.service.VNPayService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Validated
@RestController
@RequestMapping("/api/customer/payment")
public class CustomerPaymentController {

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final MomoPaymentMethodRepository momoMethodRepository;
    private final VNPayPaymentMethodRepository vnpayMethodRepository;
    private final CODPaymentMethodRepository codMethodRepository;
    private final PaymentService paymentService;
    private final MomoService momoService;
    private final VNPayService vnpayService;
    private final ObjectMapper objectMapper;
    private final ProductVariantRepository productVariantRepository;

    public CustomerPaymentController(CustomerRepository customerRepository,
                                     AddressRepository addressRepository,
                                     OrderRepository orderRepository,
                                     PaymentLogRepository paymentLogRepository,
                                     MomoPaymentMethodRepository momoMethodRepository,
                                     VNPayPaymentMethodRepository vnpayMethodRepository,
                                     CODPaymentMethodRepository codMethodRepository,
                                     PaymentService paymentService,
                                     MomoService momoService,
                                     VNPayService vnpayService,
                                     ObjectMapper objectMapper,
                                     ProductVariantRepository productVariantRepository) {
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.paymentLogRepository = paymentLogRepository;
        this.momoMethodRepository = momoMethodRepository;
        this.vnpayMethodRepository = vnpayMethodRepository;
        this.codMethodRepository = codMethodRepository;
        this.paymentService = paymentService;
        this.momoService = momoService;
        this.vnpayService = vnpayService;
        this.objectMapper = objectMapper;
        this.productVariantRepository = productVariantRepository;
    }


    @GetMapping("/checkout-summary")
    public ResponseEntity<CheckoutSummaryResponseDto> getCheckoutSummary(
            @RequestParam List<String> cartItemIds,
            Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        Cart cart = customer.getCart();
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty. Please add products before checkout.");
        }

        List<CartItem> matchedItems = cart.getItems().stream()
                .filter(item -> cartItemIds.contains(item.getId()))
                .collect(Collectors.toList());

        if (matchedItems.isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty. Please add products before checkout.");
        }

        // Validate stock availability
        for (CartItem item : matchedItems) {
            List<ProductVariant> availableUnits = productVariantRepository.findAvailablePhysicalUnits(
                    item.getProductVariant().getProduct().getId(),
                    item.getProductVariant().getRamGb(),
                    item.getProductVariant().getStorageGb(),
                    item.getProductVariant().getColor()
            );
            if (availableUnits.size() < item.getQuantity()) {
                throw new IllegalArgumentException("Some items in your cart are no longer available. Please remove or update them to continue.");
            }
        }

        BigDecimal subtotal = matchedItems.stream()
                .map(CartItem::calculateSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = BigDecimal.ZERO;
        if (customer.getMembership() != null && customer.getMembership().getBenefit() != null) {
            discount = customer.getMembership().getBenefit().calculateDiscount(subtotal)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal beforeVat = subtotal.subtract(discount);
        BigDecimal vat = beforeVat.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = beforeVat.add(vat);

        List<CheckoutItemResponseDto> itemDtos = matchedItems.stream()
                .map(item -> CheckoutItemResponseDto.builder()
                        .cartItemId(item.getId())
                        .productName(item.getProductVariant().getProduct() != null ? item.getProductVariant().getProduct().getName() : "")
                        .variantName(item.getProductVariant().getDisplayName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.calculateSubtotal())
                        .bundleServices(item.getBundleServices().stream()
                                .map(BundleService::getName)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        List<PaymentMethodResponseDto> paymentMethods = new ArrayList<>();
        momoMethodRepository.findFirstByOrderByCreatedAtAsc().ifPresent(m -> 
            paymentMethods.add(PaymentMethodResponseDto.builder().id(m.getId()).name(m.getName()).description(m.getDescription()).type("MOMO").build())
        );
        vnpayMethodRepository.findFirstByOrderByCreatedAtAsc().ifPresent(v -> 
            paymentMethods.add(PaymentMethodResponseDto.builder().id(v.getId()).name(v.getName()).description(v.getDescription()).type("VNPAY").build())
        );
        codMethodRepository.findFirstByOrderByCreatedAtAsc().ifPresent(c -> 
            paymentMethods.add(PaymentMethodResponseDto.builder().id(c.getId()).name(c.getName()).description(c.getDescription()).type("COD").build())
        );

        return ResponseEntity.ok(CheckoutSummaryResponseDto.builder()
                .items(itemDtos)
                .subtotal(subtotal)
                .discount(discount)
                .vat(vat)
                .total(total)
                .membershipTier(customer.getMembership() != null ? customer.getMembership().getTier().name() : "MEMBER")
                .availablePaymentMethods(paymentMethods)
                .build());
    }

    @PostMapping("/confirm")
    public ResponseEntity<PaymentConfirmResponseDto> confirmPayment(
            @Valid @RequestBody PaymentConfirmRequestDto req,
            Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        Cart cart = customer.getCart();
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty. Please add products before checkout.");
        }

        List<CartItem> matchedItems = cart.getItems().stream()
                .filter(item -> req.getCartItemIds().contains(item.getId()))
                .collect(Collectors.toList());

        if (matchedItems.size() != req.getCartItemIds().size() || matchedItems.isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty. Please add products before checkout.");
        }

        // Validate stock availability
        for (CartItem item : matchedItems) {
            List<ProductVariant> availableUnits = productVariantRepository.findAvailablePhysicalUnits(
                    item.getProductVariant().getProduct().getId(),
                    item.getProductVariant().getRamGb(),
                    item.getProductVariant().getStorageGb(),
                    item.getProductVariant().getColor()
            );
            if (availableUnits.size() < item.getQuantity()) {
                throw new IllegalArgumentException("Some items in your cart are no longer available. Please remove or update them to continue.");
            }
        }

        Address address = addressRepository.findById(req.getAddressId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));

        // Resolve Payment Method
        PaymentMethod momo = momoMethodRepository.findById(req.getPaymentMethodId()).orElse(null);
        PaymentMethod vnpay = vnpayMethodRepository.findById(req.getPaymentMethodId()).orElse(null);
        PaymentMethod cod = codMethodRepository.findById(req.getPaymentMethodId()).orElse(null);

        if (momo == null && vnpay == null && cod == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ");
        }

        BigDecimal subtotal = matchedItems.stream()
                .map(CartItem::calculateSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = BigDecimal.ZERO;
        if (customer.getMembership() != null && customer.getMembership().getBenefit() != null) {
            discount = customer.getMembership().getBenefit().calculateDiscount(subtotal)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal beforeVat = subtotal.subtract(discount);
        BigDecimal vat = beforeVat.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalAmount = beforeVat.add(vat);

        if (cod != null) {
            // COD: Create Order and PaymentLog immediately
            CODPaymentMethod codMethod = (CODPaymentMethod) cod;
            if (!codMethod.isAmountAllowed(finalAmount)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị đơn hàng vượt quá giới hạn cho phép của COD");
            }

            Order order = new Order(customer, address, codMethod);
            boolean inventoryUpdateFailed = false;

            try {
                for (CartItem cartItem : matchedItems) {
                    List<ProductVariant> availableUnits = productVariantRepository.findAvailablePhysicalUnits(
                            cartItem.getProductVariant().getProduct().getId(),
                            cartItem.getProductVariant().getRamGb(),
                            cartItem.getProductVariant().getStorageGb(),
                            cartItem.getProductVariant().getColor()
                    );
                    if (availableUnits.size() < cartItem.getQuantity()) {
                        throw new IllegalStateException("Sản phẩm không đủ số lượng");
                    }
                    for (int i = 0; i < cartItem.getQuantity(); i++) {
                        ProductVariant unit = availableUnits.get(i);
                        OrderItem orderItem = new OrderItem(order, unit, 1, cartItem.getUnitPrice());
                        for (BundleService service : cartItem.getBundleServices()) {
                            orderItem.addBundleService(service);
                        }
                    }
                }
            } catch (Exception e) {
                inventoryUpdateFailed = true;
            }

            if (inventoryUpdateFailed) {
                try {
                    order.getItems().clear();
                    orderRepository.save(order);
                } catch (Exception ex) {
                    // Ignore
                }
                throw new com.project.tech_gadget_store.exception.InventoryUpdateException(
                        "Unable to update inventory information. Please contact support or try again later.");
            }

            Order savedOrder;
            PaymentLog savedLog;
            try {
                savedOrder = orderRepository.save(order);

                // Create pending payment log linked to order
                PaymentLog logRecord = new PaymentLog(savedOrder, finalAmount, codMethod, PaymentLogStatus.PENDING);
                savedLog = paymentLogRepository.save(logRecord);

                // Clear items from the customer's cart
                for (CartItem cartItem : matchedItems) {
                    cart.removeItem(cartItem);
                }
                customerRepository.save(customer);
            } catch (Exception e) {
                throw new com.project.tech_gadget_store.exception.OrderSaveException(
                        "Unable to complete your order. Please try again later.", e);
            }

            return ResponseEntity.ok(PaymentConfirmResponseDto.builder()
                    .paymentMethod("COD")
                    .status("PENDING")
                    .orderId(savedOrder.getId())
                    .paymentLogId(savedLog.getId())
                    .message("Đặt hàng COD thành công, chờ xác nhận")
                    .build());
        }

        // Online payment (MoMo / VNPay): Setup PaymentLog without order
        PaymentMethod activeOnlineMethod = momo != null ? momo : vnpay;
        String typeStr = momo != null ? "MOMO" : "VNPAY";

        try {
            PaymentService.CheckoutDataJson checkoutData = new PaymentService.CheckoutDataJson();
            checkoutData.customerId = customer.getId();
            checkoutData.addressId = address.getId();
            checkoutData.items = new ArrayList<>();
            for (CartItem cartItem : matchedItems) {
                PaymentService.CheckoutDataJson.CheckoutItemJson itemJson = new PaymentService.CheckoutDataJson.CheckoutItemJson();
                itemJson.productVariantId = cartItem.getProductVariant().getId();
                itemJson.quantity = cartItem.getQuantity();
                itemJson.bundleServiceIds = cartItem.getBundleServices().stream()
                        .map(BaseEntity::getId)
                        .collect(Collectors.toList());
                checkoutData.items.add(itemJson);
            }

            String serializedData = objectMapper.writeValueAsString(checkoutData);
            PaymentLog pendingLog = paymentService.createPendingOnlineLog(finalAmount, activeOnlineMethod, serializedData);

            String redirectUrl;
            if (momo != null) {
                redirectUrl = momoService.createPayment(pendingLog.getId(), finalAmount, req.getOrderInfo());
            } else {
                redirectUrl = vnpayService.buildPaymentUrl(pendingLog.getId(), finalAmount, req.getClientIp(), req.getOrderInfo());
            }

            return ResponseEntity.ok(PaymentConfirmResponseDto.builder()
                    .paymentMethod(typeStr)
                    .status("PENDING")
                    .redirectUrl(redirectUrl)
                    .paymentLogId(pendingLog.getId())
                    .message("Khởi tạo thanh toán online thành công, chuyển hướng người dùng")
                    .build());

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khởi tạo thanh toán: " + e.getMessage(), e);
        }
    }
}
