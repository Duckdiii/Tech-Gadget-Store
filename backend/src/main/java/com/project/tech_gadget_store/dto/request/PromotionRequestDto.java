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
public class PromotionRequestDto {

    @NotBlank(message = "code must not be blank")
    private String code;
    @NotBlank(message = "name must not be blank")
    private String name;
    @NotNull(message = "discountPercent must not be null")
    @DecimalMin(value = "0.0", message = "discountPercent must not be negative")
    @DecimalMax(value = "100.0", message = "discountPercent must not exceed 100")
    private Double discountPercent;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    @NotNull(message = "active must not be null")
    private Boolean active;
    @NotBlank(message = "productId must not be blank")
    private String productId;
}
