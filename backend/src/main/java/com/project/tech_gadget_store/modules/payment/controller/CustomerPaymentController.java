package com.project.tech_gadget_store.modules.payment.controller;

import com.project.tech_gadget_store.common.constants.ErrorMessages;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.order.dto.response.CheckoutItemResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.CheckoutSummaryResponseDto;
import com.project.tech_gadget_store.modules.order.entity.Cart;
import com.project.tech_gadget_store.modules.order.entity.CartItem;
import com.project.tech_gadget_store.modules.order.service.CheckoutFacade;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.request.UpdatePreferredPaymentMethodRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentMethodResponseDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PreferredPaymentMethodResponseDto;
import com.project.tech_gadget_store.modules.payment.repository.CODPaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.repository.MomoPaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.repository.VNPayPaymentMethodRepository;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



@Slf4j
@Validated
@RestController
@RequestMapping("/api/customer/payment")
public class CustomerPaymentController {

    private final CustomerRepository customerRepository;
    private final MomoPaymentMethodRepository momoMethodRepository;
    private final VNPayPaymentMethodRepository vnpayMethodRepository;
    private final CODPaymentMethodRepository codMethodRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CheckoutFacade checkoutFacade;

    public CustomerPaymentController(CustomerRepository customerRepository,
            MomoPaymentMethodRepository momoMethodRepository,
            VNPayPaymentMethodRepository vnpayMethodRepository,
            CODPaymentMethodRepository codMethodRepository,
            ProductVariantRepository productVariantRepository,
            CheckoutFacade checkoutFacade) {
        this.customerRepository = customerRepository;
        this.momoMethodRepository = momoMethodRepository;
        this.vnpayMethodRepository = vnpayMethodRepository;
        this.codMethodRepository = codMethodRepository;
        this.productVariantRepository = productVariantRepository;
        this.checkoutFacade = checkoutFacade;
    }

    @GetMapping("/checkout-summary")
    public ResponseEntity<CheckoutSummaryResponseDto> getCheckoutSummary(
            @RequestParam List<String> cartItemIds,
            Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND));

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
                        .productName(item.getProductVariant().getProduct() != null
                                ? item.getProductVariant().getProduct().getName()
                                : "")
                        .variantName(item.getProductVariant().getDisplayName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.calculateSubtotal())
                        .bundleServices(item.getBundleServices().stream()
                                .map(BundleService::getName)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        List<PaymentMethodResponseDto> paymentMethods = listAvailablePaymentMethods();

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
        PaymentConfirmResponseDto response = checkoutFacade.confirmCheckout(req, authentication.getName(),
                req.getClientIp());
        return ResponseEntity.ok(response);
    }

    /**
     * Phương thức thanh toán "ưu tiên" của khách — chỉ là tham chiếu tới 1 cổng thanh toán hệ
     * thống đã cấu hình sẵn (MOMO/VNPAY/COD), KHÔNG lưu bất kỳ thông tin thẻ/tài khoản nào.
     */
    @GetMapping("/preferred-method")
    public ResponseEntity<PreferredPaymentMethodResponseDto> getPreferredMethod(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND));
        return ResponseEntity.ok(PreferredPaymentMethodResponseDto.builder()
                .available(listAvailablePaymentMethods())
                .preferred(customer.getPreferredPaymentType())
                .build());
    }

    @PutMapping("/preferred-method")
    public ResponseEntity<PreferredPaymentMethodResponseDto> updatePreferredMethod(
            @Valid @RequestBody UpdatePreferredPaymentMethodRequestDto request,
            Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND));

        List<PaymentMethodResponseDto> available = listAvailablePaymentMethods();
        boolean isValidChoice = available.stream().anyMatch(m -> m.getType().equals(request.getPaymentType()));
        if (!isValidChoice) {
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ hoặc chưa được kích hoạt.");
        }

        customer.setPreferredPaymentType(request.getPaymentType());
        customerRepository.save(customer);

        return ResponseEntity.ok(PreferredPaymentMethodResponseDto.builder()
                .available(available)
                .preferred(customer.getPreferredPaymentType())
                .build());
    }

    private List<PaymentMethodResponseDto> listAvailablePaymentMethods() {
        List<PaymentMethodResponseDto> paymentMethods = new ArrayList<>();
        momoMethodRepository.findFirstByOrderByCreatedAtAsc().ifPresent(m -> paymentMethods.add(PaymentMethodResponseDto
                .builder().id(m.getId()).name(m.getName()).description(m.getDescription()).type("MOMO").build()));
        vnpayMethodRepository.findFirstByOrderByCreatedAtAsc()
                .ifPresent(v -> paymentMethods.add(PaymentMethodResponseDto.builder().id(v.getId()).name(v.getName())
                        .description(v.getDescription()).type("VNPAY").build()));
        codMethodRepository.findFirstByOrderByCreatedAtAsc().ifPresent(c -> paymentMethods.add(PaymentMethodResponseDto
                .builder().id(c.getId()).name(c.getName()).description(c.getDescription()).type("COD").build()));
        return paymentMethods;
    }
}
