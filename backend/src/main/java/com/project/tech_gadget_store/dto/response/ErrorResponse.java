package com.project.tech_gadget_store.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // XÃ³a cÃ¡c trÆ°á»ng null cho JSON gá»n gÃ ng
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status; // 400, 401, 404...
    private String error; // "Not Found", "Bad Request"
    private String message; // CÃ¢u thÃ´ng bÃ¡o chi tiáº¿t
    private String path; // API nÃ o bá»‹ lá»—i
    private List<FieldErrorDetail> validationErrors; // Danh sÃ¡ch lá»—i form (náº¿u cÃ³)
}
