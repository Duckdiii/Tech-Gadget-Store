package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
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
public class InvoiceRequestDto {

    @NotBlank(message = "orderId must not be blank")
    private String orderId;
    @NotNull(message = "vatAmount must not be null")
    @DecimalMin(value = "0.00", message = "vatAmount must not be negative")
    private BigDecimal vatAmount;
    @NotNull(message = "discountAmount must not be null")
    @DecimalMin(value = "0.00", message = "discountAmount must not be negative")
    private BigDecimal discountAmount;
    @NotNull(message = "finalAmount must not be null")
    @DecimalMin(value = "0.00", message = "finalAmount must not be negative")
    private BigDecimal finalAmount;
    private LocalDateTime issuedAt;
}
