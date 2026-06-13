package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;

import com.project.tech_gadget_store.entity.enums.NotificationStatus;
import java.time.LocalDateTime;
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
public class NotificationRequestDto {

    @NotBlank(message = "title must not be blank")
    private String title;
    @NotBlank(message = "message must not be blank")
    private String message;
    @NotNull(message = "status must not be null")
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
}
