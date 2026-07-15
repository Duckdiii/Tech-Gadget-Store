package com.project.tech_gadget_store.modules.chatbot.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatSendRequestDto {

    @NotBlank(message = "content must not be blank")
    private String content;
}
