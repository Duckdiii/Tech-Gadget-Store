package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceInUseException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.request.BrandRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.BrandResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;




@ExtendWith(MockitoExtension.class)
class BrandServiceTest {

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private BrandService brandService;

    private BrandRequestDto validDto() {
        BrandRequestDto dto = new BrandRequestDto();
        dto.setName("Apple");
        dto.setLogoUrl("http://logo.png");
        dto.setDescription("Phone maker");
        return dto;
    }

    @Test
    void createBrand_success() {
        BrandRequestDto dto = validDto();
        when(brandRepository.existsByNameIgnoreCase("Apple")).thenReturn(false);
        when(brandRepository.save(any(Brand.class))).thenAnswer(inv -> inv.getArgument(0));

        BrandResponseDto result = brandService.createBrand(dto);

        assertThat(result.getName()).isEqualTo("Apple");
        verify(brandRepository).save(any(Brand.class));
    }

    @Test
    void createBrand_duplicateName_throwsDuplicateResourceException() {
        BrandRequestDto dto = validDto();
        when(brandRepository.existsByNameIgnoreCase("Apple")).thenReturn(true);

        assertThatThrownBy(() -> brandService.createBrand(dto))
                .isInstanceOf(DuplicateResourceException.class);

        verify(brandRepository, never()).save(any());
    }

    @Test
    void updateBrand_success() {
        Brand existing = new Brand("Apple", "http://logo.png", "Phone maker");
        existing.setId("brand-1");
        BrandRequestDto dto = validDto();
        dto.setName("Apple Inc");

        when(brandRepository.findById("brand-1")).thenReturn(Optional.of(existing));
        when(brandRepository.existsByNameIgnoreCaseAndIdNot("Apple Inc", "brand-1")).thenReturn(false);
        when(brandRepository.save(any(Brand.class))).thenAnswer(inv -> inv.getArgument(0));

        BrandResponseDto result = brandService.updateBrand("brand-1", dto);

        assertThat(result.getName()).isEqualTo("Apple Inc");
    }

    @Test
    void updateBrand_notFound_throwsResourceNotFoundException() {
        when(brandRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> brandService.updateBrand("missing", validDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeBrand_notInUse_deletesBrand() {
        Brand existing = new Brand("Apple", "http://logo.png", "Phone maker");
        existing.setId("brand-1");
        when(brandRepository.findById("brand-1")).thenReturn(Optional.of(existing));
        when(productRepository.existsByBrandId("brand-1")).thenReturn(false);

        brandService.removeBrand("brand-1");

        verify(brandRepository).delete(existing);
    }

    @Test
    void removeBrand_inUse_throwsResourceInUseException() {
        Brand existing = new Brand("Apple", "http://logo.png", "Phone maker");
        existing.setId("brand-1");
        when(brandRepository.findById("brand-1")).thenReturn(Optional.of(existing));
        when(productRepository.existsByBrandId("brand-1")).thenReturn(true);

        assertThatThrownBy(() -> brandService.removeBrand("brand-1"))
                .isInstanceOf(ResourceInUseException.class);

        verify(brandRepository, never()).delete(any());
    }
}
