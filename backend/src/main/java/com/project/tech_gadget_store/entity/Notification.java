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

    @OneToMany(mappedBy = "notification", fetch = FetchType.LAZY)
    private List<ProductSubscription> productSubscriptions = new ArrayList<>();

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void prePersistNotification() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Notification(String title, NotificationType type, List<NotificationChannel> channels, String message) {
        this.title = title;
        this.type = type;
        this.channels = new ArrayList<>(channels);
        this.message = message;
    }

    public void addProductSubscription(ProductSubscription productSubscription) {
        productSubscriptions.add(productSubscription);
        productSubscription.setNotification(this);
    }
}
