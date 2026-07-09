package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.repository.*;
import com.project.tech_gadget_store.exception.InventoryUpdateException;
import com.project.tech_gadget_store.exception.OrderSaveException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CheckoutFacade {

    private final UserRepository userRepository;
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
    private final ProductVariantRepository productVariantRepository;
    private final ApplicationEventPublisher eventPublisher;

    public CheckoutFacade(UserRepository userRepository,
                          CustomerRepository customerRepository,
                          AddressRepository addressRepository,
                          OrderRepository orderRepository,
                          PaymentLogRepository paymentLogRepository,
                          MomoPaymentMethodRepository momoMethodRepository,
                          VNPayPaymentMethodRepository vnpayMethodRepository,
                          CODPaymentMethodRepository codMethodRepository,
                          PaymentService paymentService,
                          MomoService momoService,
                          VNPayService vnpayService,
                          ProductVariantRepository productVariantRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
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
        this.productVariantRepository = productVariantRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public PaymentConfirmResponseDto confirmCheckout(PaymentConfirmRequestDto req, String customerEmail, String clientIp) {
        Customer customer = customerRepository.findByAccountEmail(customerEmail)
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

        // Track initial stock values
        List<Product> productsToNotify = matchedItems.stream()
                .map(item -> item.getProductVariant().getProduct())
                .distinct()
                .collect(Collectors.toList());

        java.util.Map<String, Long> oldStocks = new java.util.HashMap<>();
        for (Product p : productsToNotify) {
            oldStocks.put(p.getId(), productVariantRepository.countAvailablePhysicalUnitsByProductId(p.getId()));
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

            Order order = Order.builder()
                    .customer(customer)
                    .address(address)
                    .selectedPaymentMethod(codMethod)
                    .orderDate(LocalDateTime.now())
                    .build();
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
                throw new InventoryUpdateException(
                        "Unable to update inventory information. Please contact support or try again later.");
            }

            Order savedOrder;
            PaymentLog savedLog;
            try {
                savedOrder = orderRepository.save(order);

                // Create pending payment log linked to order
                PaymentLog logRecord = new PaymentLog(savedOrder, finalAmount, PaymentLogStatus.PENDING);
                savedLog = paymentLogRepository.save(logRecord);

                // Clear items from the customer's cart
                for (CartItem cartItem : matchedItems) {
                    cart.removeItem(cartItem);
                }
                customerRepository.save(customer);
            } catch (Exception e) {
                throw new OrderSaveException(
                        "Unable to complete your order. Please try again later.", e);
            }

            // Publish stock change events
            for (Product p : productsToNotify) {
                try {
                    long oldStock = oldStocks.getOrDefault(p.getId(), 0L);
                    long newStock = productVariantRepository.countAvailablePhysicalUnitsByProductId(p.getId());
                    eventPublisher.publishEvent(new com.project.tech_gadget_store.event.ProductStockChangedEvent(p, oldStock, newStock));
                } catch (Exception e) {
                    log.error("Failed to publish ProductStockChangedEvent: {}", e.getMessage(), e);
                }
            }

            return PaymentConfirmResponseDto.builder()
                    .paymentMethod("COD")
                    .status("PENDING")
                    .orderId(savedOrder.getId())
                    .paymentLogId(savedLog.getId())
                    .message("Đặt hàng COD thành công, chờ xác nhận")
                    .build();
        }

        // Online payment (MoMo / VNPay): Setup Order first, then PaymentLog
        PaymentMethod activeOnlineMethod = momo != null ? momo : vnpay;
        String typeStr = momo != null ? "MOMO" : "VNPAY";

        Order order = Order.builder()
                .customer(customer)
                .address(address)
                .selectedPaymentMethod(activeOnlineMethod)
                .orderDate(LocalDateTime.now())
                .build();
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
            throw new InventoryUpdateException(
                    "Unable to update inventory information. Please contact support or try again later.");
        }

        Order savedOrder;
        PaymentLog savedLog;
        try {
            savedOrder = orderRepository.save(order);

            // Create pending payment log linked to order
            savedLog = paymentService.createPendingLog(savedOrder.getId(), finalAmount, momo != null);

            // Clear items from the customer's cart
            for (CartItem cartItem : matchedItems) {
                cart.removeItem(cartItem);
            }
            customerRepository.save(customer);
        } catch (Exception e) {
            throw new OrderSaveException(
                    "Unable to complete your order. Please try again later.", e);
        }

        // Publish stock change events
        for (Product p : productsToNotify) {
            try {
                long oldStock = oldStocks.getOrDefault(p.getId(), 0L);
                long newStock = productVariantRepository.countAvailablePhysicalUnitsByProductId(p.getId());
                eventPublisher.publishEvent(new com.project.tech_gadget_store.event.ProductStockChangedEvent(p, oldStock, newStock));
            } catch (Exception e) {
                log.error("Failed to publish ProductStockChangedEvent: {}", e.getMessage(), e);
            }
        }

        try {
            String redirectUrl;
            if (momo != null) {
                redirectUrl = momoService.createPayment(savedLog.getId(), finalAmount, req.getOrderInfo());
            } else {
                redirectUrl = vnpayService.buildPaymentUrl(savedLog.getId(), finalAmount, clientIp, req.getOrderInfo());
            }

            return PaymentConfirmResponseDto.builder()
                    .paymentMethod(typeStr)
                    .status("PENDING")
                    .redirectUrl(redirectUrl)
                    .paymentLogId(savedLog.getId())
                    .message("Khởi tạo thanh toán online thành công, chuyển hướng người dùng")
                    .build();

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khởi tạo thanh toán: " + e.getMessage(), e);
        }
    }
}
