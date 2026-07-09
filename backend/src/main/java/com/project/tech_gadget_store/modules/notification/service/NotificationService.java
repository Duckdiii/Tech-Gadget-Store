package com.project.tech_gadget_store.modules.notification.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.User;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.notification.dto.response.NotificationResponseDto;
import com.project.tech_gadget_store.modules.notification.entity.Notification;
import com.project.tech_gadget_store.modules.notification.repository.NotificationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AccountRepository accountRepository;

    public List<NotificationResponseDto> getMyNotifications(String email) {
        User user = resolveUser(email);
        return notificationRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Transactional
    public NotificationResponseDto markRead(String email, String notificationId) {
        User user = resolveUser(email);
        Notification notification = notificationRepository.findByIdAndCustomerId(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.markRead();
        return toResponseDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead(String email) {
        User user = resolveUser(email);
        List<Notification> unread = notificationRepository.findByCustomerIdAndReadAtIsNull(user.getId());
        unread.forEach(Notification::markRead);
        notificationRepository.saveAll(unread);
    }

    private User resolveUser(String email) {
        return accountRepository.findByEmail(email)
                .map(com.project.tech_gadget_store.modules.auth.entity.Account::getUser)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private NotificationResponseDto toResponseDto(Notification n) {
        return NotificationResponseDto.builder()
                .id(n.getId())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .title(n.getTitle())
                .type(n.getType())
                .message(n.getMessage())
                .status(n.getStatus())
                .sentAt(n.getSentAt())
                .readAt(n.getReadAt())
                .build();
    }
}
