package com.project.tech_gadget_store.modules.support.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketRequestDto {

    @NotBlank(message = "subject must not be blank")
    private String subject;

    @NotBlank(message = "category must not be blank")
    private String category;

    @NotBlank(message = "message must not be blank")
    private String message;
}
