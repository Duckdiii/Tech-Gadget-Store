package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

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
public class ReceiptRequestDto {

    @NotBlank(message = "exportLogId must not be blank")
    private String exportLogId;
    private LocalDateTime issuedAt;
    @NotBlank(message = "fileUrl must not be blank")
    private String fileUrl;
}
