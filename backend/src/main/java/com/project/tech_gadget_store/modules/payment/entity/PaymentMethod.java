package com.project.tech_gadget_store.modules.payment.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "payment_methods")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
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
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        this.name = name;
        this.description = description;
    }

    public void enable() {
        enabled = true;
    }

    public void disable() {
        enabled = false;
    }

    public boolean isEnabled() {
        return Boolean.TRUE.equals(enabled);
    }

    public void changeDescription(String description) {
        this.description = description;
    }
}
