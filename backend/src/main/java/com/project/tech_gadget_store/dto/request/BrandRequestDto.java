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
public class BrandRequestDto {

    @NotBlank(message = "name must not be blank")
    private String name;
    @NotBlank(message = "logoUrl must not be blank")
    private String logoUrl;
    @NotBlank(message = "description must not be blank")
    private String description;
}
