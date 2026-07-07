package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ImportLogItemRequestDto;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SupplyOrderService {

    private static final Map<POStatus, POStatus> NEXT_STATUS = Map.of(
            POStatus.PENDING, POStatus.CONFIRMED,
            POStatus.CONFIRMED, POStatus.SHIPPING,
            POStatus.SHIPPING, POStatus.DELIVERED
    );

    private final SupplyOrderRepository supplyOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final SupplyOrderMapper supplyOrderMapper;
    private final ImportLogService importLogService;

    @Transactional
    public SupplyOrderResponseDto createSupplyOrder(SupplyOrderRequestDto dto) {
        if (isBlank(dto.getSupplierId()) || dto.getExpectedDeliveryDate() == null) {
            throw new MissingRequiredFieldException("Please fill in all required fields");
        }
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new NoOrderItemsException("Please add at least one product to the order");
        }
        for (SupplyOrderItemRequestDto itemDto : dto.getItems()) {
            if (isBlank(itemDto.getProductVariantId())) {
                throw new MissingRequiredFieldException("Please fill in all required fields");
            }
            if (itemDto.getQuantity() == null || itemDto.getQuantity() <= 0
                    || itemDto.getUnitPrice() == null || itemDto.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidOrderItemException("Quantity and unit price must be greater than zero");
            }
        }
        if (!dto.getExpectedDeliveryDate().isAfter(LocalDate.now())) {
            throw new InvalidDeliveryDateException("Expected delivery date must be in the future");
        }

        Supplier supplier = supplierRepository.findByIdAndIsActiveTrue(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + dto.getSupplierId()));

        SupplyOrder order = new SupplyOrder(supplier);
        order.setNotes(dto.getNotes());
        order.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());

        for (SupplyOrderItemRequestDto itemDto : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with id: " + itemDto.getProductVariantId()));
            new SupplyOrderItem(order, variant, itemDto.getQuantity(), itemDto.getUnitPrice());
        }

        return supplyOrderMapper.toResponseDto(supplyOrderRepository.save(order));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Transactional
    public SupplyOrderResponseDto updateStatus(String orderId, SupplyOrderStatusUpdateRequestDto dto) {
        SupplyOrder order = supplyOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplyOrder not found with id: " + orderId));

        if (order.getStatus() == POStatus.CANCELLED || order.getStatus() == POStatus.DELIVERED) {
            throw new SupplyOrderFinalizedException(
                    "This Supply Order has already been completed or cancelled and cannot be updated");
        }

        POStatus newStatus = dto.getStatus();
        boolean isNextStep = newStatus == NEXT_STATUS.get(order.getStatus());
        boolean isCancel = newStatus == POStatus.CANCELLED;
        if (!isNextStep && !isCancel) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition. Please follow the correct order: PENDING → CONFIRMED → SHIPPING → DELIVERED");
        }

        switch (newStatus) {
            case CONFIRMED -> order.confirm();
            case SHIPPING -> order.ship();
            case DELIVERED -> order.deliver();
            case CANCELLED -> order.cancel();
            default -> throw new InvalidStatusTransitionException(
                    "Invalid status transition. Please follow the correct order: PENDING → CONFIRMED → SHIPPING → DELIVERED");
        }

        SupplyOrder saved = supplyOrderRepository.save(order);

        if (newStatus == POStatus.DELIVERED) {
            triggerImportProducts(saved);
        }

        return supplyOrderMapper.toResponseDto(saved);
    }

    private void triggerImportProducts(SupplyOrder order) {
        List<ImportLogItemRequestDto> items = order.getItems().stream()
                .map(item -> ImportLogItemRequestDto.builder()
                        .productVariantId(item.getProduct().getId())
                        .quantity(item.getQuantity())
                        .importPrice(item.getUnitPrice())
                        .build())
                .toList();

        ImportLogRequestDto requestDto = ImportLogRequestDto.builder()
                .performedById(currentUserId())
                .note("Auto-imported from Supply Order #" + order.getId())
                .items(items)
                .build();

        importLogService.importProducts(requestDto);
    }

    private String currentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof AccountUserDetails accountUserDetails) {
            return accountUserDetails.getUserId();
        }
        throw new IllegalStateException("Unable to resolve current user for import trigger");
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
