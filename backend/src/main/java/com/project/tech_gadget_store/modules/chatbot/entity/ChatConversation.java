package com.project.tech_gadget_store.modules.chatbot.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Mỗi khách có 1 conversation đang hoạt động, tạo lazy khi mở chat lần đầu (xem
 * {@code ChatbotService}). customerId lưu dạng String thuần, không @ManyToOne, theo cùng
 * cách {@code RecommendationExperimentLog} tránh lazy-loading không cần thiết.
 */
@Entity
@Table(name = "chat_conversation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatConversation extends BaseEntity {

    @Column(name = "customer_id", nullable = false, length = 36)
    private String customerId;

    public ChatConversation(String customerId) {
        this.customerId = customerId;
    }
}
