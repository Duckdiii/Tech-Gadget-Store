package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.SupplierRequestDto;
import com.project.tech_gadget_store.dto.response.SupplierResponseDto;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.SupplierMapper;
import com.project.tech_gadget_store.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private SupplierMapper supplierMapper;

    @InjectMocks
    private SupplierService supplierService;

    private SupplierRequestDto validDto() {
        SupplierRequestDto dto = new SupplierRequestDto();
        dto.setName("Tech Corp");
        dto.setContactPerson("Nguyen Van A");
        dto.setPhone("0901234567");
        dto.setEmail("contact@techcorp.com");
        dto.setAddress("123 Tech Street");
        return dto;
    }

    @Test
    void createSupplier_success() {
        SupplierRequestDto dto = validDto();
        when(supplierRepository.existsByNameIgnoreCase(dto.getName())).thenReturn(false);
        Supplier saved = new Supplier("Tech Corp");
        when(supplierRepository.save(any(Supplier.class))).thenReturn(saved);
        SupplierResponseDto responseDto = SupplierResponseDto.builder().name("Tech Corp").isActive(true).build();
        when(supplierMapper.toResponseDto(saved)).thenReturn(responseDto);

        SupplierResponseDto result = supplierService.createSupplier(dto);

        assertThat(result.getName()).isEqualTo("Tech Corp");
        assertThat(result.getIsActive()).isTrue();
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    void createSupplier_duplicateName_throwsDuplicateResourceException() {
        SupplierRequestDto dto = validDto();
        when(supplierRepository.existsByNameIgnoreCase(dto.getName())).thenReturn(true);

        assertThatThrownBy(() -> supplierService.createSupplier(dto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Tech Corp");

        verify(supplierRepository, never()).save(any());
    }

    @Test
    void updateSupplier_success() {
        SupplierRequestDto dto = validDto();
        dto.setName("Updated Corp");
        Supplier existing = new Supplier("Tech Corp");
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(existing));
        when(supplierRepository.existsByNameIgnoreCaseAndIdNot("Updated Corp", "sup-1")).thenReturn(false);
        when(supplierRepository.save(existing)).thenReturn(existing);
        SupplierResponseDto responseDto = SupplierResponseDto.builder().name("Updated Corp").build();
        when(supplierMapper.toResponseDto(existing)).thenReturn(responseDto);

        SupplierResponseDto result = supplierService.updateSupplier("sup-1", dto);

        assertThat(result.getName()).isEqualTo("Updated Corp");
        verify(supplierRepository).save(existing);
    }

    @Test
    void updateSupplier_notFound_throwsResourceNotFoundException() {
        when(supplierRepository.findByIdAndIsActiveTrue("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> supplierService.updateSupplier("unknown", validDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeSupplier_success() {
        Supplier supplier = new Supplier("Tech Corp");
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(supplier));

        supplierService.removeSupplier("sup-1");

        assertThat(supplier.getIsActive()).isFalse();
        verify(supplierRepository).save(supplier);
    }

    @Test
    void removeSupplier_notFound_throwsResourceNotFoundException() {
        when(supplierRepository.findByIdAndIsActiveTrue("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> supplierService.removeSupplier("unknown"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
