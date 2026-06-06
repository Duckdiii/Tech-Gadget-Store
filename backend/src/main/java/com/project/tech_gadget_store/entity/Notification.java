package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.entity.enums.NotificationStatus;
import com.project.tech_gadget_store.entity.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_subscription_id", nullable = false)
    private ProductSubscription productSubscription;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private NotificationType type;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "notification_channels", joinColumns = @JoinColumn(name = "notification_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private List<NotificationChannel> channels = new ArrayList<>();

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
    protected void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Notification(ProductSubscription productSubscription, String title, NotificationType type,
            String message, List<NotificationChannel> channels) {

        this.productSubscription = productSubscription;
        this.title = title;
        this.type = type;
        this.message = message;
        if (channels != null) {
            this.channels.addAll(channels);
        }
        productSubscription.getNotifications().add(this);
    }

    public void markSent() {
        status = NotificationStatus.SUCCESS;
        sentAt = LocalDateTime.now();
    }

    public void markFailed() {
        status = NotificationStatus.FAILURE;
    }

    public void markRead() {
        readAt = LocalDateTime.now();
    }

    public boolean isRead() {
        return readAt != null;
    }
}
