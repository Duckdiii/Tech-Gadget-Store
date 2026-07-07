package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.BrandRequestDto;
import com.project.tech_gadget_store.dto.response.BrandResponseDto;
import com.project.tech_gadget_store.entity.Brand;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceInUseException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.BrandRepository;
import com.project.tech_gadget_store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Transactional
    public BrandResponseDto createBrand(BrandRequestDto dto) {
        if (brandRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Brand name already exists. Please use a different name");
        }
        Brand brand = new Brand(dto.getName(), dto.getLogoUrl(), dto.getDescription());
        return toResponseDto(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponseDto updateBrand(String id, BrandRequestDto dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        if (brandRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("Brand name already exists. Please use a different name");
        }
        brand.setName(dto.getName());
        brand.setLogoUrl(dto.getLogoUrl());
        brand.setDescription(dto.getDescription());
        return toResponseDto(brandRepository.save(brand));
    }

    @Transactional
    public void removeBrand(String id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        if (productRepository.existsByBrandId(id)) {
            throw new ResourceInUseException("Cannot remove a brand that still has products. Please reassign or remove those products first");
        }
        brandRepository.delete(brand);
    }

    public List<BrandResponseDto> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::toResponseDto)
                .toList();
    }

    private BrandResponseDto toResponseDto(Brand brand) {
        return BrandResponseDto.builder()
                .id(brand.getId())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .name(brand.getName())
                .logoUrl(brand.getLogoUrl())
                .description(brand.getDescription())
                .build();
    }
}
