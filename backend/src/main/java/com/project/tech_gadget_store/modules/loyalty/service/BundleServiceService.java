package com.project.tech_gadget_store.modules.loyalty.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.loyalty.dto.request.BundleServiceRequestDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BundleServiceService {

    private final BundleServiceRepository bundleServiceRepository;

    @Transactional
    public BundleServiceResponseDto createBundleService(BundleServiceRequestDto dto) {
        BundleService bundleService = new BundleService(
                dto.getName(), dto.getType(), dto.getDescription(), dto.getPrice(),
                dto.getDurationMonths(), dto.getActive());
        return toResponseDto(bundleServiceRepository.save(bundleService));
    }

    @Transactional
    public BundleServiceResponseDto updateBundleService(String id, BundleServiceRequestDto dto) {
        BundleService bundleService = bundleServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bundle service not found with id: " + id));

        bundleService.setName(dto.getName());
        bundleService.setType(dto.getType());
        bundleService.setDescription(dto.getDescription());
        bundleService.changePrice(dto.getPrice());
        bundleService.setDurationMonths(dto.getDurationMonths());
        if (Boolean.TRUE.equals(dto.getActive())) {
            bundleService.activate();
        } else {
            bundleService.deactivate();
        }
        return toResponseDto(bundleServiceRepository.save(bundleService));
    }

    @Transactional
    public void removeBundleService(String id) {
        BundleService bundleService = bundleServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bundle service not found with id: " + id));
        bundleService.deactivate();
        bundleServiceRepository.save(bundleService);
    }

    public List<BundleServiceResponseDto> getAllBundleServices() {
        return bundleServiceRepository.findAll().stream()
                .map(this::toResponseDto)
                .toList();
    }

    private BundleServiceResponseDto toResponseDto(BundleService bundleService) {
        return BundleServiceResponseDto.builder()
                .id(bundleService.getId())
                .createdAt(bundleService.getCreatedAt())
                .updatedAt(bundleService.getUpdatedAt())
                .name(bundleService.getName())
                .type(bundleService.getType())
                .description(bundleService.getDescription())
                .price(bundleService.getPrice())
                .durationMonths(bundleService.getDurationMonths())
                .active(bundleService.getActive())
                .build();
    }
}
