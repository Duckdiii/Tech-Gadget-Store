package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ImportLogRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderItemRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderRequestDto;
import com.project.tech_gadget_store.dto.request.SupplyOrderStatusUpdateRequestDto;
import com.project.tech_gadget_store.dto.response.SupplyOrderResponseDto;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.SupplyOrder;
import com.project.tech_gadget_store.entity.SupplyOrderItem;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.entity.enums.POStatus;
import com.project.tech_gadget_store.exception.InvalidDeliveryDateException;
import com.project.tech_gadget_store.exception.InvalidOrderItemException;
import com.project.tech_gadget_store.exception.InvalidStatusTransitionException;
import com.project.tech_gadget_store.exception.MissingRequiredFieldException;
import com.project.tech_gadget_store.exception.NoOrderItemsException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.exception.SupplyOrderFinalizedException;
import com.project.tech_gadget_store.mapper.SupplyOrderMapper;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.repository.SupplyOrderRepository;
import com.project.tech_gadget_store.repository.SupplierRepository;
import com.project.tech_gadget_store.security.AccountUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    @Mock
    private ImportLogService importLogService;

    @InjectMocks
    private SupplyOrderService supplyOrderService;

    private AccountUserDetails principal;

    @BeforeEach
    void setUpSecurityContext() {
        principal = mock(AccountUserDetails.class);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, List.of()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

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
        dto.setExpectedDeliveryDate(LocalDate.now().plusDays(7));
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

        SupplyOrderRequestDto dto = validCreateDto();
        SupplyOrderResponseDto result = supplyOrderService.createSupplyOrder(dto);

        assertThat(result.getStatus()).isEqualTo(POStatus.PENDING);
        ArgumentCaptor<SupplyOrder> captor = ArgumentCaptor.forClass(SupplyOrder.class);
        verify(supplyOrderRepository).save(captor.capture());
        assertThat(captor.getValue().getExpectedDeliveryDate()).isEqualTo(dto.getExpectedDeliveryDate());
    }

    @Test
    void createSupplyOrder_supplierNotFound_throwsResourceNotFoundException() {
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(validCreateDto()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("sup-1");
    }

    @Test
    void createSupplyOrder_missingSupplierId_throwsMissingRequiredFieldException() {
        SupplyOrderRequestDto dto = validCreateDto();
        dto.setSupplierId(null);

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(dto))
                .isInstanceOf(MissingRequiredFieldException.class)
                .hasMessage("Please fill in all required fields");

        verifyNoInteractions(supplyOrderRepository);
    }

    @Test
    void createSupplyOrder_missingExpectedDeliveryDate_throwsMissingRequiredFieldException() {
        SupplyOrderRequestDto dto = validCreateDto();
        dto.setExpectedDeliveryDate(null);

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(dto))
                .isInstanceOf(MissingRequiredFieldException.class)
                .hasMessage("Please fill in all required fields");

        verifyNoInteractions(supplyOrderRepository);
    }

    @Test
    void createSupplyOrder_noItems_throwsNoOrderItemsException() {
        SupplyOrderRequestDto dto = validCreateDto();
        dto.setItems(List.of());

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(dto))
                .isInstanceOf(NoOrderItemsException.class)
                .hasMessage("Please add at least one product to the order");

        verifyNoInteractions(supplyOrderRepository);
    }

    @Test
    void createSupplyOrder_missingProductVariantId_throwsMissingRequiredFieldException() {
        SupplyOrderRequestDto dto = validCreateDto();
        dto.getItems().get(0).setProductVariantId(null);

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(dto))
                .isInstanceOf(MissingRequiredFieldException.class)
                .hasMessage("Please fill in all required fields");

        verifyNoInteractions(supplyOrderRepository);
    }

    @Test
    void createSupplyOrder_zeroQuantity_throwsInvalidOrderItemException() {
        SupplyOrderRequestDto dto = validCreateDto();
        dto.getItems().get(0).setQuantity(0);

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(dto))
                .isInstanceOf(InvalidOrderItemException.class)
                .hasMessage("Quantity and unit price must be greater than zero");

        verifyNoInteractions(supplyOrderRepository);
    }

    @Test
    void createSupplyOrder_zeroUnitPrice_throwsInvalidOrderItemException() {
        SupplyOrderRequestDto dto = validCreateDto();
        dto.getItems().get(0).setUnitPrice(BigDecimal.ZERO);

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(dto))
                .isInstanceOf(InvalidOrderItemException.class)
                .hasMessage("Quantity and unit price must be greater than zero");

        verifyNoInteractions(supplyOrderRepository);
    }

    @Test
    void createSupplyOrder_pastDeliveryDate_throwsInvalidDeliveryDateException() {
        SupplyOrderRequestDto dto = validCreateDto();
        dto.setExpectedDeliveryDate(LocalDate.now().minusDays(1));

        assertThatThrownBy(() -> supplyOrderService.createSupplyOrder(dto))
                .isInstanceOf(InvalidDeliveryDateException.class)
                .hasMessage("Expected delivery date must be in the future");

        verifyNoInteractions(supplyOrderRepository);
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
    void updateStatus_pendingToShipping_throwsInvalidStatusTransitionException() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.SHIPPING);

        assertThatThrownBy(() -> supplyOrderService.updateStatus("order-1", dto))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Invalid status transition. Please follow the correct order: PENDING → CONFIRMED → SHIPPING → DELIVERED");
    }

    @Test
    void updateStatus_deliveredToCancelled_throwsSupplyOrderFinalizedException() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        order.confirm();
        order.ship();
        order.deliver();
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.CANCELLED);

        assertThatThrownBy(() -> supplyOrderService.updateStatus("order-1", dto))
                .isInstanceOf(SupplyOrderFinalizedException.class)
                .hasMessage("This Supply Order has already been completed or cancelled and cannot be updated");
    }

    @Test
    void updateStatus_alreadyCancelled_throwsSupplyOrderFinalizedException() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        order.cancel();
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.CONFIRMED);

        assertThatThrownBy(() -> supplyOrderService.updateStatus("order-1", dto))
                .isInstanceOf(SupplyOrderFinalizedException.class)
                .hasMessage("This Supply Order has already been completed or cancelled and cannot be updated");
    }

    @Test
    void updateStatus_invalidTransition_pendingToDelivered_throwsInvalidStatusTransitionException() {
        SupplyOrder order = new SupplyOrder(activeSupplier());
        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.DELIVERED);

        assertThatThrownBy(() -> supplyOrderService.updateStatus("order-1", dto))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Invalid status transition. Please follow the correct order: PENDING → CONFIRMED → SHIPPING → DELIVERED");
    }

    @Test
    void updateStatus_shippingToDelivered_triggersImportProducts() {
        when(principal.getUserId()).thenReturn("user-1");

        SupplyOrder order = new SupplyOrder(activeSupplier());
        order.confirm();
        order.ship();
        ProductVariant variant = mock(ProductVariant.class);
        when(variant.getId()).thenReturn("variant-1");
        new SupplyOrderItem(order, variant, 5, new BigDecimal("500000"));

        when(supplyOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(supplyOrderRepository.save(order)).thenReturn(order);
        SupplyOrderResponseDto responseDto = SupplyOrderResponseDto.builder().status(POStatus.DELIVERED).build();
        when(supplyOrderMapper.toResponseDto(order)).thenReturn(responseDto);

        SupplyOrderStatusUpdateRequestDto dto = new SupplyOrderStatusUpdateRequestDto();
        dto.setStatus(POStatus.DELIVERED);

        SupplyOrderResponseDto result = supplyOrderService.updateStatus("order-1", dto);

        assertThat(result.getStatus()).isEqualTo(POStatus.DELIVERED);
        ArgumentCaptor<ImportLogRequestDto> captor = ArgumentCaptor.forClass(ImportLogRequestDto.class);
        verify(importLogService).importProducts(captor.capture());
        ImportLogRequestDto captured = captor.getValue();
        assertThat(captured.getPerformedById()).isEqualTo("user-1");
        assertThat(captured.getItems()).hasSize(1);
        assertThat(captured.getItems().get(0).getProductVariantId()).isEqualTo("variant-1");
        assertThat(captured.getItems().get(0).getQuantity()).isEqualTo(5);
        assertThat(captured.getItems().get(0).getImportPrice()).isEqualByComparingTo(new BigDecimal("500000"));
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
