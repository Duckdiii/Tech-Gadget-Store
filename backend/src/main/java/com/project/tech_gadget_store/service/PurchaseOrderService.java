package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PurchaseOrderItemRequestDto;
import com.project.tech_gadget_store.dto.request.PurchaseOrderRequestDto;
import com.project.tech_gadget_store.dto.request.PurchaseOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.dto.response.PurchaseOrderResponseDto;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.PurchaseOrder;
import com.project.tech_gadget_store.entity.PurchaseOrderItem;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.entity.enums.PurchaseOrderStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.PurchaseOrderMapper;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.repository.PurchaseOrderRepository;
import com.project.tech_gadget_store.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PurchaseOrderMapper purchaseOrderMapper;

    @Transactional
    public PurchaseOrderResponseDto createPurchaseOrder(PurchaseOrderRequestDto dto) {
        Supplier supplier = supplierRepository.findByIdAndIsActiveTrue(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + dto.getSupplierId()));

        PurchaseOrder order = new PurchaseOrder(supplier, dto.getOrderedBy());
        order.setNote(dto.getNote());

        for (PurchaseOrderItemRequestDto itemDto : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with id: " + itemDto.getProductVariantId()));
            new PurchaseOrderItem(order, variant, itemDto.getQuantity(), itemDto.getUnitPrice());
        }

        return purchaseOrderMapper.toResponseDto(purchaseOrderRepository.save(order));
    }

    @Transactional
    public PurchaseOrderResponseDto updateStatus(String orderId, PurchaseOrderStatusUpdateRequestDto dto) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + orderId));

        switch (dto.getStatus()) {
            case APPROVED -> order.approve();
            case RECEIVED -> order.receive();
            case CANCELLED -> order.cancel();
            default -> throw new IllegalArgumentException("Invalid status transition to: " + dto.getStatus());
        }

        return purchaseOrderMapper.toResponseDto(purchaseOrderRepository.save(order));
    }

    public List<PurchaseOrderResponseDto> getAll() {
        return purchaseOrderRepository.findAll().stream()
                .map(purchaseOrderMapper::toResponseDto)
                .toList();
    }

    public PurchaseOrderResponseDto getById(String id) {
        return purchaseOrderRepository.findById(id)
                .map(purchaseOrderMapper::toResponseDto)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + id));
    }

    public List<PurchaseOrderResponseDto> getByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.findAllByStatus(status).stream()
                .map(purchaseOrderMapper::toResponseDto)
                .toList();
    }
}
