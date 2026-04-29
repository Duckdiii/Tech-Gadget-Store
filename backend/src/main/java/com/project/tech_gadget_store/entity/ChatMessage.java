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
@Table("chat_messages")
public class ChatMessage {
    @Id
    private UUID id;
    @Column("session_id")
    private UUID sessionId;
    @Column("sender_type")
    private String senderType;
    private String content;
    @Column("created_at")
    private OffsetDateTime createdAt;
}
