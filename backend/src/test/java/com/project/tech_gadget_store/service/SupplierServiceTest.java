package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.SupplierRequestDto;
import com.project.tech_gadget_store.dto.response.SupplierResponseDto;
import com.project.tech_gadget_store.entity.Supplier;
import com.project.tech_gadget_store.entity.enums.POStatus;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.MissingRequiredFieldException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.exception.SupplierEditRestrictedException;
import com.project.tech_gadget_store.exception.SupplierRemovalRestrictedException;
import com.project.tech_gadget_store.mapper.SupplierMapper;
import com.project.tech_gadget_store.repository.SupplierRepository;
import com.project.tech_gadget_store.repository.SupplyOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
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

    @Mock
    private SupplyOrderRepository supplyOrderRepository;

    @InjectMocks
    private SupplierService supplierService;

    private SupplierRequestDto validDto() {
        SupplierRequestDto dto = new SupplierRequestDto();
        dto.setName("Tech Corp");
        dto.setPhone("0901234567");
        dto.setEmail("contact@techcorp.com");
        dto.setAddress("123 Tech Street");
        return dto;
    }

    @Test
    void createSupplier_success() {
        SupplierRequestDto dto = validDto();
        when(supplierRepository.existsByNameIgnoreCase(dto.getName())).thenReturn(false);
        Supplier saved = new Supplier("Tech Corp", null, null, null);
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
                .hasMessage("Supplier name already exists. Please use a different name");

        verify(supplierRepository, never()).save(any());
    }

    @Test
    void createSupplier_missingRequiredField_throwsMissingRequiredFieldException() {
        SupplierRequestDto dto = validDto();
        dto.setPhone(null);

        assertThatThrownBy(() -> supplierService.createSupplier(dto))
                .isInstanceOf(MissingRequiredFieldException.class)
                .hasMessage("Please fill in all required fields");

        verifyNoInteractions(supplierRepository);
    }

    @Test
    void createSupplier_blankAddress_throwsMissingRequiredFieldException() {
        SupplierRequestDto dto = validDto();
        dto.setAddress("   ");

        assertThatThrownBy(() -> supplierService.createSupplier(dto))
                .isInstanceOf(MissingRequiredFieldException.class)
                .hasMessage("Please fill in all required fields");

        verifyNoInteractions(supplierRepository);
    }

    @Test
    void updateSupplier_success() {
        SupplierRequestDto dto = validDto();
        dto.setName("Updated Corp");
        Supplier existing = new Supplier("Tech Corp", null, null, null);
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(existing));
        when(supplierRepository.existsByNameIgnoreCaseAndIdNot("Updated Corp", "sup-1")).thenReturn(false);
        when(supplierRepository.save(existing)).thenReturn(existing);
        SupplierResponseDto responseDto = SupplierResponseDto.builder().name("Updated Corp").build();
        when(supplierMapper.toResponseDto(existing, false)).thenReturn(responseDto);

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
    void updateSupplier_duplicateName_throwsDuplicateResourceException() {
        SupplierRequestDto dto = validDto();
        dto.setName("Updated Corp");
        Supplier existing = new Supplier("Tech Corp", null, null, null);
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(existing));
        when(supplierRepository.existsByNameIgnoreCaseAndIdNot("Updated Corp", "sup-1")).thenReturn(true);

        assertThatThrownBy(() -> supplierService.updateSupplier("sup-1", dto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Supplier name already exists");

        verify(supplierRepository, never()).save(any());
    }

    @Test
    void updateSupplier_hasActiveOrdersAndFieldsChanged_throwsSupplierEditRestrictedException() {
        SupplierRequestDto dto = validDto();
        dto.setName("Updated Corp");
        Supplier existing = new Supplier("Tech Corp", null, null, null);
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(existing));
        when(supplyOrderRepository.existsBySupplierIdAndStatusIn("sup-1", List.of(POStatus.PENDING, POStatus.CONFIRMED, POStatus.SHIPPING)))
                .thenReturn(true);

        assertThatThrownBy(() -> supplierService.updateSupplier("sup-1", dto))
                .isInstanceOf(SupplierEditRestrictedException.class)
                .hasMessage("Some fields cannot be edited while there are Supply Orders");

        verify(supplierRepository, never()).save(any());
    }

    @Test
    void updateSupplier_hasActiveOrdersButFieldsUnchanged_success() {
        Supplier existing = new Supplier("Tech Corp", "0901234567", "contact@techcorp.com", "123 Tech Street");
        SupplierRequestDto dto = validDto();
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(existing));
        when(supplyOrderRepository.existsBySupplierIdAndStatusIn("sup-1", List.of(POStatus.PENDING, POStatus.CONFIRMED, POStatus.SHIPPING)))
                .thenReturn(true);
        when(supplierRepository.existsByNameIgnoreCaseAndIdNot("Tech Corp", "sup-1")).thenReturn(false);
        when(supplierRepository.save(existing)).thenReturn(existing);
        SupplierResponseDto responseDto = SupplierResponseDto.builder().name("Tech Corp").build();
        when(supplierMapper.toResponseDto(existing, true)).thenReturn(responseDto);

        SupplierResponseDto result = supplierService.updateSupplier("sup-1", dto);

        assertThat(result.getName()).isEqualTo("Tech Corp");
        verify(supplierRepository).save(existing);
    }

    @Test
    void getAllSuppliers_marksHasActiveSupplyOrders() {
        Supplier locked = new Supplier("Locked Corp", null, null, null);
        locked.setId("locked-1");
        Supplier free = new Supplier("Free Corp", null, null, null);
        free.setId("free-1");
        when(supplierRepository.findAllByIsActiveTrue()).thenReturn(List.of(locked, free));
        when(supplyOrderRepository.findDistinctSupplierIdsByStatusIn(List.of(POStatus.PENDING, POStatus.CONFIRMED, POStatus.SHIPPING)))
                .thenReturn(List.of("locked-1"));
        SupplierResponseDto lockedDto = SupplierResponseDto.builder().name("Locked Corp").hasActiveSupplyOrders(true).build();
        SupplierResponseDto freeDto = SupplierResponseDto.builder().name("Free Corp").hasActiveSupplyOrders(false).build();
        when(supplierMapper.toResponseDto(locked, true)).thenReturn(lockedDto);
        when(supplierMapper.toResponseDto(free, false)).thenReturn(freeDto);

        List<SupplierResponseDto> result = supplierService.getAllSuppliers();

        assertThat(result).extracting(SupplierResponseDto::getHasActiveSupplyOrders).containsExactly(true, false);
    }

    @Test
    void removeSupplier_success() {
        Supplier supplier = new Supplier("Tech Corp", null, null, null);
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

    @Test
    void removeSupplier_hasActiveOrders_throwsSupplierRemovalRestrictedException() {
        Supplier supplier = new Supplier("Tech Corp", null, null, null);
        when(supplierRepository.findByIdAndIsActiveTrue("sup-1")).thenReturn(Optional.of(supplier));
        when(supplyOrderRepository.existsBySupplierIdAndStatusIn("sup-1", List.of(POStatus.PENDING, POStatus.CONFIRMED, POStatus.SHIPPING)))
                .thenReturn(true);

        assertThatThrownBy(() -> supplierService.removeSupplier("sup-1"))
                .isInstanceOf(SupplierRemovalRestrictedException.class)
                .hasMessage("Cannot remove supplier with active Purchase Orders. Please cancel or complete all related orders first");

        assertThat(supplier.getIsActive()).isTrue();
        verify(supplierRepository, never()).save(any());
    }
}
