package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.chatbot")
@Getter
@Setter
public class ChatbotProperties {

    private String apiKey;
    private String model = "gemini-2.5-flash";
    private int maxToolRounds = 3;
}
