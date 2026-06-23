package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.StaffRequestDto;
import com.project.tech_gadget_store.dto.response.StaffResponseDto;
import com.project.tech_gadget_store.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping
    public ResponseEntity<StaffResponseDto> addStaff(@Valid @RequestBody StaffRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.addStaff(dto));
    }
}
