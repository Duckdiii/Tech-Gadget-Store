package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
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
public class ImportLogItemRequestDto {

    /**
     * ID của ProductVariant đã có trong hệ thống (Alternative Flow 5a).
     * Nếu để trống, hệ thống sẽ dùng newProduct để tạo sản phẩm mới (Alternative Flow 5b).
     */
    private String productVariantId;

    /**
     * Thông tin sản phẩm mới – dùng khi productVariantId trống (Alternative Flow 5b).
     */
    @Valid
    private NewProductImportDto newProduct;

    @NotNull(message = "quantity must not be null")
    @Positive(message = "quantity must be positive")
    private Integer quantity;

    @NotNull(message = "importPrice must not be null")
    @DecimalMin(value = "0.00", message = "importPrice must not be negative")
    private BigDecimal importPrice;
}
