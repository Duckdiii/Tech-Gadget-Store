package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.NotificationResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.Notification;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;

    public List<NotificationResponseDto> getMyNotifications(String email) {
        Customer customer = resolveCustomer(email);
        return notificationRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Transactional
    public NotificationResponseDto markRead(String email, String notificationId) {
        Customer customer = resolveCustomer(email);
        Notification notification = notificationRepository.findByIdAndCustomerId(notificationId, customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.markRead();
        return toResponseDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead(String email) {
        Customer customer = resolveCustomer(email);
        List<Notification> unread = notificationRepository.findByCustomerIdAndReadAtIsNull(customer.getId());
        unread.forEach(Notification::markRead);
        notificationRepository.saveAll(unread);
    }

    private Customer resolveCustomer(String email) {
        return customerRepository.findByAccountEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
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
