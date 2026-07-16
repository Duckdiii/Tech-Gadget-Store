package com.project.tech_gadget_store.modules.support.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.support.entity.enums.TicketStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SupportTicket extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "subject", nullable = false, length = 200)
    private String subject;

    @Column(name = "category", nullable = false, length = 60)
    private String category;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;

    public SupportTicket(Customer customer, String subject, String category, String message) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("subject must not be blank");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message must not be blank");
        }
        this.customer = customer;
        this.subject = subject;
        this.category = category;
        this.message = message;
        this.status = TicketStatus.OPEN;
    }
}
