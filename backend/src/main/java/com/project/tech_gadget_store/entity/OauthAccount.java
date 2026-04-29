package com.project.tech_gadget_store.entity;

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
@Table("oauth_accounts")
public class OauthAccount {
    @Id
    private UUID id;
    @Column("account_id")
    private UUID accountId;
    private String provider;
    @Column("provider_user_id")
    private String providerUserId;
}
