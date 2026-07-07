package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.NotificationResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.Membership;
import com.project.tech_gadget_store.entity.MembershipBenefit;
import com.project.tech_gadget_store.entity.Notification;
import com.project.tech_gadget_store.entity.enums.MembershipTier;
import com.project.tech_gadget_store.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.entity.enums.NotificationType;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Customer customer() {
        Membership membership = new Membership(MembershipTier.STANDARD,
                new MembershipBenefit(0.0, false, "desc"), null, null);
        Customer c = new Customer("Alice", "0900000000", membership);
        c.setId("cust-1");
        return c;
    }

    @Test
    void getMyNotifications_returnsMappedList() {
        Customer customer = customer();
        Notification n = new Notification(customer, "Còn hàng trở lại", NotificationType.RESTOCKED,
                "Sản phẩm bạn theo dõi đã có hàng", List.of(NotificationChannel.WEB));

        when(customerRepository.findByAccountEmail("alice@test.com")).thenReturn(Optional.of(customer));
        when(notificationRepository.findByCustomerIdOrderByCreatedAtDesc("cust-1")).thenReturn(List.of(n));

        List<NotificationResponseDto> result = notificationService.getMyNotifications("alice@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Còn hàng trở lại");
        assertThat(result.get(0).getType()).isEqualTo(NotificationType.RESTOCKED);
    }

    @Test
    void getMyNotifications_customerNotFound_throwsResourceNotFoundException() {
        when(customerRepository.findByAccountEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.getMyNotifications("missing@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void markRead_success() {
        Customer customer = customer();
        Notification n = new Notification(customer, "Title", NotificationType.PROMOTION,
                "msg", List.of(NotificationChannel.WEB));
        n.setId("notif-1");

        when(customerRepository.findByAccountEmail("alice@test.com")).thenReturn(Optional.of(customer));
        when(notificationRepository.findByIdAndCustomerId("notif-1", "cust-1")).thenReturn(Optional.of(n));
        when(notificationRepository.save(n)).thenReturn(n);

        NotificationResponseDto result = notificationService.markRead("alice@test.com", "notif-1");

        assertThat(result.getReadAt()).isNotNull();
        assertThat(n.isRead()).isTrue();
    }

    @Test
    void markRead_notFound_throwsResourceNotFoundException() {
        Customer customer = customer();
        when(customerRepository.findByAccountEmail("alice@test.com")).thenReturn(Optional.of(customer));
        when(notificationRepository.findByIdAndCustomerId("missing", "cust-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markRead("alice@test.com", "missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void markAllRead_marksEveryUnreadNotification() {
        Customer customer = customer();
        Notification n1 = new Notification(customer, "A", NotificationType.PROMOTION, "m1", List.of(NotificationChannel.WEB));
        Notification n2 = new Notification(customer, "B", NotificationType.OUT_OF_STOCK, "m2", List.of(NotificationChannel.WEB));

        when(customerRepository.findByAccountEmail("alice@test.com")).thenReturn(Optional.of(customer));
        when(notificationRepository.findByCustomerIdAndReadAtIsNull("cust-1")).thenReturn(List.of(n1, n2));

        notificationService.markAllRead("alice@test.com");

        assertThat(n1.isRead()).isTrue();
        assertThat(n2.isRead()).isTrue();
        verify(notificationRepository).saveAll(anyList());
    }
}
