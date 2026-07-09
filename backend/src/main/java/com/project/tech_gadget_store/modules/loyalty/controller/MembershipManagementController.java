package com.project.tech_gadget_store.modules.loyalty.controller;

import com.project.tech_gadget_store.modules.loyalty.dto.request.MembershipRequestDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.MembershipResponseDto;
import com.project.tech_gadget_store.modules.loyalty.service.MembershipManagementService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/manager/memberships")
@RequiredArgsConstructor
public class MembershipManagementController {

    private final MembershipManagementService membershipManagementService;

    @PostMapping
    public ResponseEntity<MembershipResponseDto> createMembership(@Valid @RequestBody MembershipRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membershipManagementService.createMembership(dto));
    }

    @GetMapping
    public ResponseEntity<List<MembershipResponseDto>> getAllMemberships() {
        return ResponseEntity.ok(membershipManagementService.getAllMemberships());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembershipResponseDto> updateMembership(
            @PathVariable String id,
            @Valid @RequestBody MembershipRequestDto dto) {
        return ResponseEntity.ok(membershipManagementService.updateMembership(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeMembership(@PathVariable String id) {
        membershipManagementService.removeMembership(id);
        return ResponseEntity.noContent().build();
    }
}
