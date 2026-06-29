package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.SupplierRequestDto;
import com.project.tech_gadget_store.dto.response.SupplierResponseDto;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.SupplierMapper;
import com.project.tech_gadget_store.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Transactional
    public SupplierResponseDto createSupplier(SupplierRequestDto dto) {
        if (supplierRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Supplier with name '" + dto.getName() + "' already exists");
        }
        Supplier supplier = new Supplier(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        return supplierMapper.toResponseDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierResponseDto updateSupplier(String id, SupplierRequestDto dto) {
        Supplier supplier = supplierRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        if (supplierRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("Supplier with name '" + dto.getName() + "' already exists");
        }
        supplier.setName(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        return supplierMapper.toResponseDto(supplierRepository.save(supplier));
    }

    @Transactional
    public void removeSupplier(String id) {
        Supplier supplier = supplierRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.deactivate();
        supplierRepository.save(supplier);
    }

    public List<SupplierResponseDto> getAllSuppliers() {
        return supplierRepository.findAllByIsActiveTrue().stream()
                .map(supplierMapper::toResponseDto)
                .toList();
    }
}
