package com.project.tech_gadget_store.modules.chatbot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Một khung tin nhắn đẩy qua {@code /user/queue/chatbot} trong lúc streaming.
 * {@code delta} là
 * đoạn text mới nhận được từ model (rỗng ở khung cuối); {@code done=true} báo
 * hiệu turn đã kết
 * thúc; {@code error} chỉ có giá trị khi luồng xử lý gặp lỗi.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
// là DTO trả về cho FE trong lúc streaming, mỗi lần FE nhận được 1 chunk thì sẽ
// append vào chatbox
public class ChatStreamChunkDto {
    private String conversationId; // Cuộc hội thoại nào
    private String delta; // Đoạn text mới nhất vừa nhận được từ Gemini
    private boolean done; // đã trả lời xong chưa?
    private String error; // Chỉ có giá trị khi xử lý gặp lỗi (ví dụ Gemini API lỗi)
}
