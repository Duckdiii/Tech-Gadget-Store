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

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "favorite_product_id")
    private FavoriteProduct favoriteProduct;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    public Notification(Customer customer, String title, NotificationType type, String message, List<NotificationChannel> channels) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        if (type == null) {
            throw new IllegalArgumentException("type must not be null");
        }
        if (channels == null) {
            throw new IllegalArgumentException("channels must not be null");
        }
        this.customer = customer;
        this.title = title;
        this.type = type;
        this.message = message;
        this.channels.addAll(channels);
        customer.getNotifications().add(this);
    }

    public void markSent() {
        status = NotificationStatus.SUCCESS;
        sentAt = LocalDateTime.now();
    }

    public void markFailed() {
        status = NotificationStatus.FAILURE;
    }

    public void markRead() {
        if (readAt == null)
            readAt = LocalDateTime.now();
    }

    public boolean isRead() {
        return readAt != null;
    }
}
