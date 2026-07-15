package com.project.tech_gadget_store.modules.chatbot.dto.response;

import com.project.tech_gadget_store.modules.chatbot.entity.enums.ChatRole;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponseDto {// dùng để trả về FE khi FE gọi API lấy lịch sử chat
    private String id;
    private ChatRole role;
    private String content;
    private LocalDateTime createdAt;
}
