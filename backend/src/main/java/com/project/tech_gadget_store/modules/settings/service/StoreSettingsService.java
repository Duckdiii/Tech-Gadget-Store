package com.project.tech_gadget_store.modules.settings.service;

import com.project.tech_gadget_store.modules.settings.dto.request.StoreSettingsRequestDto;
import com.project.tech_gadget_store.modules.settings.dto.response.StoreSettingsResponseDto;
import com.project.tech_gadget_store.modules.settings.entity.StoreSettings;
import com.project.tech_gadget_store.modules.settings.repository.StoreSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class StoreSettingsService {

    private static final String DEFAULT_STORE_NAME = "TechStore Vietnam";
    private static final String DEFAULT_CONTACT_EMAIL = "contact@techstore.vn";
    private static final String DEFAULT_CONTACT_PHONE = "1900 1234";
    private static final String DEFAULT_ADDRESS = "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh";

    private final StoreSettingsRepository storeSettingsRepository;

    public StoreSettingsService(StoreSettingsRepository storeSettingsRepository) {
        this.storeSettingsRepository = storeSettingsRepository;
    }

    public StoreSettingsResponseDto getSettings() {
        return toDto(getOrCreateSettings());
    }

    @Transactional
    public StoreSettingsResponseDto updateSettings(StoreSettingsRequestDto dto) {
        StoreSettings settings = getOrCreateSettings();
        settings.setStoreName(dto.getStoreName());
        settings.setContactEmail(dto.getContactEmail());
        settings.setContactPhone(dto.getContactPhone());
        settings.setAddress(dto.getAddress());
        settings.setAllowProductReviews(dto.isAllowProductReviews());
        return toDto(storeSettingsRepository.save(settings));
    }

    /** Enforcement point for the "Cho phép đánh giá sản phẩm" toggle — see ReviewService.createReview. */
    public boolean isProductReviewsAllowed() {
        return getOrCreateSettings().isAllowProductReviews();
    }

    private StoreSettings getOrCreateSettings() {
        return storeSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> storeSettingsRepository.save(new StoreSettings(
                        DEFAULT_STORE_NAME, DEFAULT_CONTACT_EMAIL, DEFAULT_CONTACT_PHONE, DEFAULT_ADDRESS, true)));
    }

    private StoreSettingsResponseDto toDto(StoreSettings settings) {
        return StoreSettingsResponseDto.builder()
                .storeName(settings.getStoreName())
                .contactEmail(settings.getContactEmail())
                .contactPhone(settings.getContactPhone())
                .address(settings.getAddress())
                .allowProductReviews(settings.isAllowProductReviews())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
