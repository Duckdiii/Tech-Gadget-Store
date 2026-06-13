package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

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
public class ProductImageRequestDto {

    @NotBlank(message = "name must not be blank")
    private String name;
    @NotBlank(message = "imageUrl must not be blank")
    private String imageUrl;
    @NotBlank(message = "productId must not be blank")
    private String productId;
}
