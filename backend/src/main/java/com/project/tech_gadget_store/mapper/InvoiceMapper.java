package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.InvoiceItemResponseDto;
import com.project.tech_gadget_store.dto.response.InvoiceResponseDto;
import com.project.tech_gadget_store.entity.Address;
import com.project.tech_gadget_store.entity.BundleService;
import com.project.tech_gadget_store.entity.Invoice;
import com.project.tech_gadget_store.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class InvoiceMapper {

    public InvoiceResponseDto toInvoiceResponseDto(Invoice invoice) {
        if (invoice == null) {
            return null;
        }

        List<InvoiceItemResponseDto> itemDtos = Collections.emptyList();
        String paymentMethodName = null;
        String customerName = null;
        String customerPhone = null;
        String shippingAddress = null;

        if (invoice.getOrder() != null) {
            if (invoice.getOrder().getItems() != null) {
                itemDtos = invoice.getOrder().getItems().stream()
                        .map(this::toInvoiceItemResponseDto)
                        .collect(Collectors.toList());
            }
            if (invoice.getOrder().getSelectedPaymentMethod() != null) {
                paymentMethodName = invoice.getOrder().getSelectedPaymentMethod().getName();
            }
            if (invoice.getOrder().getCustomer() != null) {
                customerName = invoice.getOrder().getCustomer().getFullName();
                customerPhone = invoice.getOrder().getCustomer().getPhone();
            }
            if (invoice.getOrder().getAddress() != null) {
                Address addr = invoice.getOrder().getAddress();
                shippingAddress = addr.getStreet() + ", " + addr.getWard() + ", " + addr.getDistrict() + ", " + addr.getProvince();
            }
        }

        return InvoiceResponseDto.builder()
                .id(invoice.getId())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .orderId(invoice.getOrder() != null ? invoice.getOrder().getId() : null)
                .originalAmount(invoice.getOriginalAmount())
                .vatAmount(invoice.getVatAmount())
                .discountAmount(invoice.getDiscountAmount())
                .finalAmount(invoice.getFinalAmount())
                .issuedAt(invoice.getIssuedAt())
                .paymentMethod(paymentMethodName)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .shippingAddress(shippingAddress)
                .items(itemDtos)
                .build();
    }

    public InvoiceItemResponseDto toInvoiceItemResponseDto(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }

        String productName = null;
        String variantName = null;
        if (orderItem.getProductVariant() != null) {
            variantName = orderItem.getProductVariant().getDisplayName();
            if (orderItem.getProductVariant().getProduct() != null) {
                productName = orderItem.getProductVariant().getProduct().getName();
            }
        }

        List<String> bundleNames = Collections.emptyList();
        if (orderItem.getBundleServices() != null) {
            bundleNames = orderItem.getBundleServices().stream()
                    .map(BundleService::getName)
                    .collect(Collectors.toList());
        }

        return InvoiceItemResponseDto.builder()
                .productName(productName)
                .variantName(variantName)
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPriceAtOrder())
                .totalPrice(orderItem.calculateTotal())
                .bundleServices(bundleNames)
                .build();
    }
}
