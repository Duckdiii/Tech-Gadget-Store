package com.project.tech_gadget_store.modules.settings.controller;

import com.project.tech_gadget_store.modules.settings.dto.request.StoreSettingsRequestDto;
import com.project.tech_gadget_store.modules.settings.dto.response.StoreSettingsResponseDto;
import com.project.tech_gadget_store.modules.settings.service.StoreSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


/** Backs "Cấu hình hệ thống" > "Thông tin chung" on the manager page. */
@RestController
@RequestMapping("/api/manager/store-settings")
public class StoreSettingsController {

    private final StoreSettingsService storeSettingsService;

    public StoreSettingsController(StoreSettingsService storeSettingsService) {
        this.storeSettingsService = storeSettingsService;
    }

    @GetMapping
    public ResponseEntity<StoreSettingsResponseDto> getSettings() {
        return ResponseEntity.ok(storeSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<StoreSettingsResponseDto> updateSettings(@Valid @RequestBody StoreSettingsRequestDto dto) {
        return ResponseEntity.ok(storeSettingsService.updateSettings(dto));
    }
}
