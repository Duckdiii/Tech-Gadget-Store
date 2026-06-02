package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "payment_methods")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "payment_type")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class PaymentMethod extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    protected String name;

    @Column(name = "enabled", nullable = false)
    protected Boolean enabled = true;

    @Column(name = "description", columnDefinition = "TEXT")
    protected String description;

    protected PaymentMethod(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
