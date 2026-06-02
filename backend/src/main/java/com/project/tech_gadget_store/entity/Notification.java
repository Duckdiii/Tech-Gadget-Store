package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.entity.enums.NotificationStatus;
import com.project.tech_gadget_store.entity.enums.NotificationType;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private NotificationType type;

    @ElementCollection(targetClass = NotificationChannel.class) // báo cho JPA đây là collection kiểu giá trị (enum),
                                                                // không phải entity riêng
    @CollectionTable(name = "notification_channels", joinColumns = @JoinColumn(name = "notification_id")) // tạo/đọc
                                                                                                          // bảng phụ
                                                                                                          // notification_channels

    @Enumerated(EnumType.STRING) // lưu enum dạng chữ
    @Column(name = "channel", nullable = false, length = 30)
    private List<NotificationChannel> channels = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public Notification(Customer customer, String title, NotificationType type, List<NotificationChannel> channels, String message) {
        this.customer = customer;
        this.title = title;
        this.type = type;
        this.channels = new ArrayList<>(channels);
        this.message = message;
        if (customer != null) {
            customer.getNotifications().add(this);
        }
    }

}
