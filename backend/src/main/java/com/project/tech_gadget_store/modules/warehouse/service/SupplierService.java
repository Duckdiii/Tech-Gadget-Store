package com.project.tech_gadget_store.modules.warehouse.service;

import com.project.tech_gadget_store.common.entity.enums.POStatus;
import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.MissingRequiredFieldException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.common.exception.SupplierEditRestrictedException;
import com.project.tech_gadget_store.common.exception.SupplierRemovalRestrictedException;
import com.project.tech_gadget_store.modules.warehouse.dto.request.SupplierRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.SupplierResponseDto;
import com.project.tech_gadget_store.modules.warehouse.entity.Supplier;
import com.project.tech_gadget_store.modules.warehouse.mapper.SupplierMapper;
import com.project.tech_gadget_store.modules.warehouse.repository.SupplierRepository;
import com.project.tech_gadget_store.modules.warehouse.repository.SupplyOrderRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SupplierService {

    private static final List<POStatus> ACTIVE_STATUSES = List.of(POStatus.PENDING, POStatus.CONFIRMED, POStatus.SHIPPING);

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final SupplyOrderRepository supplyOrderRepository;

    @Transactional
    public SupplierResponseDto createSupplier(SupplierRequestDto dto) {
        if (isBlank(dto.getName()) || isBlank(dto.getPhone()) || isBlank(dto.getEmail()) || isBlank(dto.getAddress())) {
            throw new MissingRequiredFieldException("Please fill in all required fields");
        }
        if (supplierRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Supplier name already exists. Please use a different name");
        }
        Supplier supplier = new Supplier(dto.getName(), dto.getPhone(), dto.getEmail(), dto.getAddress());
        return supplierMapper.toResponseDto(supplierRepository.save(supplier));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Transactional
    public SupplierResponseDto updateSupplier(String id, SupplierRequestDto dto) {
        Supplier supplier = supplierRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        boolean hasActiveOrders = supplyOrderRepository.existsBySupplierIdAndStatusIn(id, ACTIVE_STATUSES);
        boolean fieldsChanged = !Objects.equals(supplier.getName(), dto.getName())
                || !Objects.equals(supplier.getPhone(), dto.getPhone())
                || !Objects.equals(supplier.getEmail(), dto.getEmail())
                || !Objects.equals(supplier.getAddress(), dto.getAddress());

        if (hasActiveOrders && fieldsChanged) {
            throw new SupplierEditRestrictedException("Some fields cannot be edited while there are Supply Orders");
        }
        if (supplierRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("Supplier name already exists");
        }

        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        return supplierMapper.toResponseDto(supplierRepository.save(supplier), hasActiveOrders);
    }

    @Transactional
    public void removeSupplier(String id) {
        Supplier supplier = supplierRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        if (supplyOrderRepository.existsBySupplierIdAndStatusIn(id, ACTIVE_STATUSES)) {
            throw new SupplierRemovalRestrictedException(
                    "Cannot remove supplier with active Purchase Orders. Please cancel or complete all related orders first");
        }
        supplier.deactivate();
        supplierRepository.save(supplier);
    }

    public List<SupplierResponseDto> getAllSuppliers() {
        Set<String> lockedIds = new HashSet<>(supplyOrderRepository.findDistinctSupplierIdsByStatusIn(ACTIVE_STATUSES));
        return supplierRepository.findAllByIsActiveTrue().stream()
                .map(s -> supplierMapper.toResponseDto(s, lockedIds.contains(s.getId())))
                .toList();
    }
}
