package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;
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

    @NotNull(message = "startAt must not be null")
    private LocalDateTime startAt;

    @NotNull(message = "endAt must not be null")
    private LocalDateTime endAt;

    @NotNull(message = "active must not be null")
    private Boolean active;

    @NotEmpty(message = "productIds must not be empty")
    private List<String> productIds;
}
