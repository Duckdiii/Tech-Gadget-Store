package com.project.tech_gadget_store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;


@Component
@ConfigurationProperties(prefix = "app.email")
@Getter
@Setter
public class EmailProperties {

    private String fromName = "TechStore System";
    private String fromAddress;
    private String replyToMode = "customer";
    private String replyToAddress;
}
