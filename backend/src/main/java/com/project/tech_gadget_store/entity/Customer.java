package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.MembershipTier;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("customers")
public class Customer {
    @Id
    private UUID id;
    @Column("account_id")
    private UUID accountId;
    @Column("full_name")
    private String fullName;
    @Column("phone_number")
    private String phoneNumber;
    @Column("default_shipping_address")
    private String defaultShippingAddress;
    @Column("membership_tier")
    private MembershipTier membershipTier;
    @Column("reward_points")
    private Integer rewardPoints;
}
