package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("chat_sessions")
public class ChatSession {
    @Id
    private UUID id;
    @Column("account_id")
    private UUID accountId;
    private String title;
    @Column("created_at")
    private OffsetDateTime createdAt;
}
