package com.project.tech_gadget_store.modules.support.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketResponseDto {
    private String id;
    private String subject;
    private String category;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
