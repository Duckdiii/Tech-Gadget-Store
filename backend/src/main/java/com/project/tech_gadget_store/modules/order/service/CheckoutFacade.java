package com.project.tech_gadget_store.modules.order.service;

import com.project.tech_gadget_store.common.exception.InventoryUpdateException;
import com.project.tech_gadget_store.common.exception.OrderSaveException;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.AddressRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.auth.repository.UserRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent;
import com.project.tech_gadget_store.modules.order.entity.Cart;
import com.project.tech_gadget_store.modules.order.entity.CartItem;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.entity.PaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.modules.payment.repository.PaymentLogRepository;
import com.project.tech_gadget_store.modules.payment.repository.PaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.service.strategy.PaymentStrategy;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.project.tech_gadget_store.common.logging.CorrelationIdFilter;
import com.project.tech_gadget_store.config.RabbitMQConfig;
import com.project.tech_gadget_store.modules.order.event.OrderPlacedMessage;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component
public class CheckoutFacade {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductSerialRepository productSerialRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final RabbitTemplate rabbitTemplate;
    private final List<PaymentStrategy> paymentStrategies;

    public CheckoutFacade(UserRepository userRepository,
            CustomerRepository customerRepository,
            AddressRepository addressRepository,
            OrderRepository orderRepository,
            PaymentLogRepository paymentLogRepository,
            PaymentMethodRepository paymentMethodRepository,
            ProductVariantRepository productVariantRepository,
            ProductSerialRepository productSerialRepository,
            ApplicationEventPublisher eventPublisher,
            RabbitTemplate rabbitTemplate,
            List<PaymentStrategy> paymentStrategies) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.paymentLogRepository = paymentLogRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.productVariantRepository = productVariantRepository;
        this.productSerialRepository = productSerialRepository;
        this.eventPublisher = eventPublisher;
        this.rabbitTemplate = rabbitTemplate;
        this.paymentStrategies = paymentStrategies;
    }

    @Transactional
    public PaymentConfirmResponseDto confirmCheckout(PaymentConfirmRequestDto req, String customerEmail,
            String clientIp) {
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
            long availableCount = productVariantRepository.countAvailablePhysicalUnits(
                    item.getProductVariant().getProduct().getId(),
                    item.getProductVariant().getRamGb(),
                    item.getProductVariant().getStorageGb(),
                    item.getProductVariant().getColor());
            if (availableCount < item.getQuantity()) {
                throw new IllegalArgumentException(
                        "Some items in your cart are no longer available. Please remove or update them to continue.");
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
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));

        // Resolve Payment Method
        PaymentMethod paymentMethod = paymentMethodRepository.findById(req.getPaymentMethodId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Phương thức thanh toán không hợp lệ"));

        // Resolve Strategy
        PaymentStrategy activeStrategy = paymentStrategies.stream()
                .filter(strategy -> strategy.supports(req.getPaymentMethodId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Phương thức thanh toán không hỗ trợ"));

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

        // Standardized Order Setup
        Order order = Order.builder()
                .customer(customer)
                .address(address)
                .selectedPaymentMethod(paymentMethod)
                .orderDate(LocalDateTime.now())
                .build();
        boolean inventoryUpdateFailed = false;

        try {
            for (CartItem cartItem : matchedItems) {
                long availableCount = productVariantRepository.countAvailablePhysicalUnits(
                        cartItem.getProductVariant().getProduct().getId(),
                        cartItem.getProductVariant().getRamGb(),
                        cartItem.getProductVariant().getStorageGb(),
                        cartItem.getProductVariant().getColor());
                if (availableCount < cartItem.getQuantity()) {
                    throw new IllegalStateException("Sản phẩm không đủ số lượng");
                }

                List<ProductSerial> serials = productSerialRepository.findByProductVariantIdAndStatus(
                        cartItem.getProductVariant().getId(),
                        SerialStatus.IN_STOCK,
                        org.springframework.data.domain.PageRequest.of(0, cartItem.getQuantity()));

                for (int i = 0; i < cartItem.getQuantity(); i++) {
                    ProductVariant unit = availableUnits.get(i);
                    OrderItem orderItem = new OrderItem(order, unit, 1, cartItem.getUnitPrice());
                    orderItem.setId(java.util.UUID.randomUUID().toString());
                    for (BundleService service : cartItem.getBundleServices()) {
                        orderItem.addBundleService(service);
                    }

                    ProductSerial serial = serials.get(i);
                    serial.setStatus(SerialStatus.SOLD);
                    serial.setInvoiceItemId(orderItem.getId());
                    productSerialRepository.save(serial);
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
                eventPublisher.publishEvent(
                        new com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent(p,
                                oldStock, newStock));
            } catch (Exception e) {
                log.error("Failed to publish ProductStockChangedEvent: {}", e.getMessage(), e);
            }
        }

        // Delegate specific payment processing to strategy
        PaymentConfirmResponseDto response = activeStrategy.initiatePayment(savedOrder, savedLog, finalAmount, req,
                clientIp);

        // Fan out order-confirmation side effects (email, invoice, notification) via
        // RabbitMQ —
        // publish-and-forget so the response above isn't delayed by any of them.
        try {
            String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
            rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_PLACED_EXCHANGE, "",
                    new OrderPlacedMessage(savedOrder.getId()),
                    message -> {
                        if (correlationId != null) {
                            message.getMessageProperties().setCorrelationId(correlationId);
                        }
                        return message;
                    });
        } catch (Exception e) {
            log.error("Failed to publish OrderPlacedMessage for order {}: {}", savedOrder.getId(), e.getMessage(), e);
        }

        return response;
    }
}
