package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.response.NotificationResponseDto;
import com.project.tech_gadget_store.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authentication.getName()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDto> markRead(@PathVariable String id, Authentication authentication) {
        return ResponseEntity.ok(notificationService.markRead(authentication.getName(), id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        notificationService.markAllRead(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
