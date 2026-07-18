package com.project.tech_gadget_store.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerNoteRequestDto {
    @NotBlank(message = "Nội dung ghi chú không được để trống")
    private String content;
}
