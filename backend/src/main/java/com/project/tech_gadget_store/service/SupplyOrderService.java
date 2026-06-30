package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.SupplyOrderItemRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.dto.response.SupplyOrderResponseDto;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.SupplyOrder;
import com.project.tech_gadget_store.entity.SupplyOrderItem;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.entity.enums.POStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.SupplyOrderMapper;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.repository.SupplyOrderRepository;
import com.project.tech_gadget_store.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SupplyOrderService {

    private final SupplyOrderRepository supplyOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final SupplyOrderMapper supplyOrderMapper;

    @Transactional
    public SupplyOrderResponseDto createSupplyOrder(SupplyOrderRequestDto dto) {
        Supplier supplier = supplierRepository.findByIdAndIsActiveTrue(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + dto.getSupplierId()));

        SupplyOrder order = new SupplyOrder(supplier);
        order.setNotes(dto.getNotes());

        for (SupplyOrderItemRequestDto itemDto : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with id: " + itemDto.getProductVariantId()));
            new SupplyOrderItem(order, variant, itemDto.getQuantity(), itemDto.getUnitPrice());
        }

        return supplyOrderMapper.toResponseDto(supplyOrderRepository.save(order));
    }

    @Transactional
    public SupplyOrderResponseDto updateStatus(String orderId, SupplyOrderStatusUpdateRequestDto dto) {
        SupplyOrder order = supplyOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplyOrder not found with id: " + orderId));

        switch (dto.getStatus()) {
            case CONFIRMED -> order.confirm();
            case SHIPPING -> order.ship();
            case DELIVERED -> order.deliver();
            case CANCELLED -> order.cancel();
            default -> throw new IllegalArgumentException("Invalid status transition to: " + dto.getStatus());
        }

        return supplyOrderMapper.toResponseDto(supplyOrderRepository.save(order));
    }

    public List<SupplyOrderResponseDto> getAll() {
        return supplyOrderRepository.findAll().stream()
                .map(supplyOrderMapper::toResponseDto)
                .toList();
    }

    public SupplyOrderResponseDto getById(String id) {
        return supplyOrderRepository.findById(id)
                .map(supplyOrderMapper::toResponseDto)
                .orElseThrow(() -> new ResourceNotFoundException("SupplyOrder not found with id: " + id));
    }

    public List<SupplyOrderResponseDto> getByStatus(POStatus status) {
        return supplyOrderRepository.findAllByStatus(status).stream()
                .map(supplyOrderMapper::toResponseDto)
                .toList();
    }
}
