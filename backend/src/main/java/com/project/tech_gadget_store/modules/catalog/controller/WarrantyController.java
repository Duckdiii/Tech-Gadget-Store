package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.response.WarrantyResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/warranty")
@RequiredArgsConstructor
public class WarrantyController {

    private final ProductSerialRepository productSerialRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/{serialNumber}")
    public ResponseEntity<WarrantyResponseDto> getWarrantyBySerialNumber(@PathVariable String serialNumber) {
        ProductSerial serial = productSerialRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new ResourceNotFoundException("No physical product found with serial number: " + serialNumber));

        WarrantyResponseDto.WarrantyResponseDtoBuilder builder = WarrantyResponseDto.builder()
                .serialNumber(serial.getSerialNumber())
                .status(serial.getStatus().name())
                .productVariantId(serial.getProductVariant().getId())
                .productName(serial.getProductVariant().getProduct().getName());

        if (serial.getStatus() == SerialStatus.SOLD && serial.getInvoiceItemId() != null) {
            Order order = orderRepository.findByOrderItemId(serial.getInvoiceItemId()).orElse(null);
            if (order != null) {
                LocalDateTime purchaseDate = order.getOrderDate();
                LocalDateTime warrantyEndDate = purchaseDate.plusMonths(12);
                builder.purchaseDate(purchaseDate)
                       .warrantyEndDate(warrantyEndDate)
                       .isUnderWarranty(LocalDateTime.now().isBefore(warrantyEndDate));
            } else {
                builder.isUnderWarranty(false);
            }
        } else {
            builder.isUnderWarranty(false);
        }

        return ResponseEntity.ok(builder.build());
    }
}
