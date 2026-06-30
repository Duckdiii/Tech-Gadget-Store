package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.SupplyOrderItemRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.dto.response.SupplyOrderResponseDto;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.SupplyOrder;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.entity.enums.POStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.SupplyOrderMapper;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.repository.SupplyOrderRepository;
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
class SupplyOrderServiceTest {

    @Mock
    private SupplyOrderRepository supplyOrderRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private SupplyOrderMapper supplyOrderMapper;

    @InjectMocks
    private SupplyOrderService supplyOrderService;

    private Supplier activeSupplier() {
        return new Supplier("Tech Corp", null, null, null);
    }

    private SupplyOrderRequestDto validCreateDto() {
        SupplyOrderItemRequestDto item = new SupplyOrderItemRequestDto();
        item.setProductVariantId("variant-1");
        item.setQuantity(10);
        item.setUnitPrice(new BigDecimal("500000"));

        SupplyOrderRequestDto dto = new SupplyOrderRequestDto();
        dto.setSupplierId("sup-1");
        dto.setNotes("First order");
        dto.setItems(List.of(item));
        return dto;
    }

    @Test
    void createSupplyOrder_success() {
        Supplier supplier = activeSupplier();
        ProductVariant variant = mock(ProductVariant.class);
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(supplier));
        when(productVariantRepository.findById("variant-1")).thenReturn(Optional.of(variant));
        when(supplyOrderRepository.save(any(SupplyOrder.class))).thenAnswer(i -> i.getArgument(0));
        SupplyOrderResponseDto responseDto = SupplyOrderResponseDto.builder()
                .status(POStatus.PENDING).build();
        when(supplyOrderMapper.toResponseDto(any(SupplyOrder.class))).thenReturn(responseDto);

        SupplyOrderResponseDto result = supplyOrderService.createSupplyOrder(validCreateDto());

        assertThat(result.getStatus()).isEqualTo(POStatus.PENDING);
        verify(supplyOrderRepository).save(any(SupplyOrder.class));
    }

    @Test
    void createSupplyOrder_supplierNotFound_throwsResourceNotFoundException() {
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(validCreateDto()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("sup-1");
    }

    @Test
    void updateStatus_pendingToConfirmed_success() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(supplyOrderRepository.save(order)).thenReturn(order);
        SupplyOrderResponseDto responseDto = SupplyOrderResponseDto.builder()
                .status(POStatus.CONFIRMED).build();
        when(supplyOrderMapper.toResponseDto(order)).thenReturn(responseDto);

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.CONFIRMED);

        SupplyOrderResponseDto result = supplyOrderService.updateStatus("order-1", dto);

        assertThat(result.getStatus()).isEqualTo(POStatus.CONFIRMED);
        assertThat(order.getStatus()).isEqualTo(POStatus.CONFIRMED);
    }

    @Test
    void updateStatus_pendingToShipping_throwsIllegalStateException() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.SHIPPING);

        assertThatThrownBy(() -> supplyOrderService.updateStatus("order-1", dto))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void updateStatus_deliveredToCancelled_throwsIllegalStateException() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        order.confirm();
        order.ship();
        order.deliver();
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.CANCELLED);

        assertThatThrownBy(() -> supplyOrderService.updateStatus("order-1", dto))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void updateStatus_pendingToCancelled_success() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(supplyOrderRepository.save(order)).thenReturn(order);
        SupplyOrderResponseDto responseDto = SupplyOrderResponseDto.builder()
                .status(POStatus.CANCELLED).build();
        when(supplyOrderMapper.toResponseDto(order)).thenReturn(responseDto);

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.CANCELLED);

        SupplyOrderResponseDto result = supplyOrderService.updateStatus("order-1", dto);

        assertThat(result.getStatus()).isEqualTo(POStatus.CANCELLED);
        assertThat(order.getStatus()).isEqualTo(POStatus.CANCELLED);
    }
}
