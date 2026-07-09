package com.project.tech_gadget_store.modules.loyalty.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.loyalty.dto.request.BundleServiceRequestDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.BundleServiceType;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import java.math.BigDecimal;
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
class BundleServiceServiceTest {

    @Mock
    private BundleServiceRepository bundleServiceRepository;

    @InjectMocks
    private BundleServiceService bundleServiceService;

    private BundleServiceRequestDto validDto() {
        BundleServiceRequestDto dto = new BundleServiceRequestDto();
        dto.setName("12-month Warranty");
        dto.setType(BundleServiceType.WARRANTY);
        dto.setDescription("Extended warranty coverage");
        dto.setPrice(new BigDecimal("500000"));
        dto.setDurationMonths(12);
        dto.setActive(true);
        return dto;
    }

    @Test
    void createBundleService_success() {
        BundleServiceRequestDto dto = validDto();
        when(bundleServiceRepository.save(any(BundleService.class))).thenAnswer(inv -> inv.getArgument(0));

        BundleServiceResponseDto result = bundleServiceService.createBundleService(dto);

        assertThat(result.getName()).isEqualTo("12-month Warranty");
        assertThat(result.getActive()).isTrue();
        verify(bundleServiceRepository).save(any(BundleService.class));
    }

    @Test
    void updateBundleService_success() {
        BundleService existing = new BundleService("Old Name", BundleServiceType.WARRANTY, "Old desc",
                new BigDecimal("100000"), 6, true);
        existing.setId("bs-1");

        BundleServiceRequestDto dto = validDto();
        dto.setName("Updated Warranty");
        dto.setPrice(new BigDecimal("600000"));

        when(bundleServiceRepository.findById("bs-1")).thenReturn(Optional.of(existing));
        when(bundleServiceRepository.save(any(BundleService.class))).thenAnswer(inv -> inv.getArgument(0));

        BundleServiceResponseDto result = bundleServiceService.updateBundleService("bs-1", dto);

        assertThat(result.getName()).isEqualTo("Updated Warranty");
        assertThat(result.getPrice()).isEqualByComparingTo("600000");
    }

    @Test
    void updateBundleService_setActiveFalse_deactivates() {
        BundleService existing = new BundleService("Warranty", BundleServiceType.WARRANTY, "desc",
                new BigDecimal("100000"), 6, true);
        existing.setId("bs-1");

        BundleServiceRequestDto dto = validDto();
        dto.setActive(false);

        when(bundleServiceRepository.findById("bs-1")).thenReturn(Optional.of(existing));
        when(bundleServiceRepository.save(any(BundleService.class))).thenAnswer(inv -> inv.getArgument(0));

        BundleServiceResponseDto result = bundleServiceService.updateBundleService("bs-1", dto);

        assertThat(result.getActive()).isFalse();
        assertThat(existing.isActive()).isFalse();
    }

    @Test
    void updateBundleService_notFound_throwsResourceNotFoundException() {
        when(bundleServiceRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bundleServiceService.updateBundleService("missing", validDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeBundleService_deactivates() {
        BundleService existing = new BundleService("Warranty", BundleServiceType.WARRANTY, "desc",
                new BigDecimal("100000"), 6, true);
        existing.setId("bs-1");

        when(bundleServiceRepository.findById("bs-1")).thenReturn(Optional.of(existing));

        bundleServiceService.removeBundleService("bs-1");

        assertThat(existing.isActive()).isFalse();
        verify(bundleServiceRepository).save(existing);
    }

    @Test
    void removeBundleService_notFound_throwsResourceNotFoundException() {
        when(bundleServiceRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bundleServiceService.removeBundleService("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
