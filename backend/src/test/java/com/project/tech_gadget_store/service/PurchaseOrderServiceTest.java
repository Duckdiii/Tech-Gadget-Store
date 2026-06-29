package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PurchaseOrderItemRequestDto;
import com.project.tech_gadget_store.dto.request.PurchaseOrderRequestDto;
import com.project.tech_gadget_store.dto.request.PurchaseOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.dto.response.PurchaseOrderResponseDto;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.PurchaseOrder;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.entity.enums.PurchaseOrderStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.PurchaseOrderMapper;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.repository.PurchaseOrderRepository;
import com.project.tech_gadget_store.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private PurchaseOrderMapper purchaseOrderMapper;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    private Supplier activeSupplier() {
        return new Supplier("Tech Corp");
    }

    private PurchaseOrderRequestDto validCreateDto() {
        PurchaseOrderItemRequestDto item = new PurchaseOrderItemRequestDto();
        item.setProductVariantId("variant-1");
        item.setQuantity(10);
        item.setUnitPrice(new BigDecimal("500000"));

        PurchaseOrderRequestDto dto = new PurchaseOrderRequestDto();
        dto.setSupplierId("sup-1");
        dto.setOrderedBy("manager-1");
        dto.setNote("First order");
        dto.setItems(List.of(item));
        return dto;
    }

    @Test
    void createPurchaseOrder_success() {
        Supplier supplier = activeSupplier();
        ProductVariant variant = mock(ProductVariant.class);
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(supplier));
        when(productVariantRepository.findById("variant-1")).thenReturn(Optional.of(variant));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(i -> i.getArgument(0));
        PurchaseOrderResponseDto responseDto = PurchaseOrderResponseDto.builder()
                .status(PurchaseOrderStatus.PENDING).build();
        when(purchaseOrderMapper.toResponseDto(any(PurchaseOrder.class))).thenReturn(responseDto);

        PurchaseOrderResponseDto result = purchaseOrderService.createPurchaseOrder(validCreateDto());

        assertThat(result.getStatus()).isEqualTo(PurchaseOrderStatus.PENDING);
        verify(purchaseOrderRepository).save(any(PurchaseOrder.class));
    }

    @Test
    void createPurchaseOrder_supplierNotFound_throwsResourceNotFoundException() {
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> purchaseOrderService.createPurchaseOrder(validCreateDto()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("sup-1");
    }

    @Test
    void updateStatus_pendingToApproved_success() {
        PurchaseOrder order = new PurchaseOrder(activeSupplier(), "manager-1");
        when(purchaseOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(purchaseOrderRepository.save(order)).thenReturn(order);
        PurchaseOrderResponseDto responseDto = PurchaseOrderResponseDto.builder()
                .status(PurchaseOrderStatus.APPROVED).build();
        when(purchaseOrderMapper.toResponseDto(order)).thenReturn(responseDto);

        PurchaseOrderStatusUpdateRequestDto dto = new PurchaseOrderStatusUpdateRequestDto();
        dto.setStatus(PurchaseOrderStatus.APPROVED);

        PurchaseOrderResponseDto result = purchaseOrderService.updateStatus("order-1", dto);

        assertThat(result.getStatus()).isEqualTo(PurchaseOrderStatus.APPROVED);
        assertThat(order.getStatus()).isEqualTo(PurchaseOrderStatus.APPROVED);
    }

    @Test
    void updateStatus_pendingToReceived_throwsIllegalStateException() {
        PurchaseOrder order = new PurchaseOrder(activeSupplier(), "manager-1");
        when(purchaseOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        PurchaseOrderStatusUpdateRequestDto dto = new PurchaseOrderStatusUpdateRequestDto();
        dto.setStatus(PurchaseOrderStatus.RECEIVED);

        assertThatThrownBy(() -> purchaseOrderService.updateStatus("order-1", dto))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void updateStatus_receivedToCancelled_throwsIllegalStateException() {
        PurchaseOrder order = new PurchaseOrder(activeSupplier(), "manager-1");
        order.approve();
        order.receive();
        when(purchaseOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        PurchaseOrderStatusUpdateRequestDto dto = new PurchaseOrderStatusUpdateRequestDto();
        dto.setStatus(PurchaseOrderStatus.CANCELLED);

        assertThatThrownBy(() -> purchaseOrderService.updateStatus("order-1", dto))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void updateStatus_pendingToCancelled_success() {
        PurchaseOrder order = new PurchaseOrder(activeSupplier(), "manager-1");
        when(purchaseOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(purchaseOrderRepository.save(order)).thenReturn(order);
        PurchaseOrderResponseDto responseDto = PurchaseOrderResponseDto.builder()
                .status(PurchaseOrderStatus.CANCELLED).build();
        when(purchaseOrderMapper.toResponseDto(order)).thenReturn(responseDto);

        PurchaseOrderStatusUpdateRequestDto dto = new PurchaseOrderStatusUpdateRequestDto();
        dto.setStatus(PurchaseOrderStatus.CANCELLED);

        PurchaseOrderResponseDto result = purchaseOrderService.updateStatus("order-1", dto);

        assertThat(result.getStatus()).isEqualTo(PurchaseOrderStatus.CANCELLED);
        assertThat(order.getStatus()).isEqualTo(PurchaseOrderStatus.CANCELLED);
    }
}
