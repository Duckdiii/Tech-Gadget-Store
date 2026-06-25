package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload dùng khi Actor nhập một sản phẩm MỚI (Alternative Flow 5b).
 * Nếu productVariantId trong ImportLogItemRequestDto đã có giá trị,
 * thì dto này bị bỏ qua.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewProductImportDto {

    @NotBlank(message = "name must not be blank")
    private String name;

    private String description;

    @NotBlank(message = "brandId must not be blank")
    private String brandId;

    @NotBlank(message = "categoryId must not be blank")
    private String categoryId;

    private Integer ramGb;

    private Integer storageGb;

    private String color;

    @NotNull(message = "price must not be null")
    @DecimalMin(value = "0.00", message = "price must not be negative")
    private BigDecimal price;
}
