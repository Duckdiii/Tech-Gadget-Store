package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldErrorDetail {
    private String field; // TÃªn cá»™t bá»‹ lá»—i (VD: email)
    private String message; // Chi tiáº¿t lá»—i (VD: Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng)
}
