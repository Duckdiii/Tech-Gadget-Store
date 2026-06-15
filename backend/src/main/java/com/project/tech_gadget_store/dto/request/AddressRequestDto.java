package com.project.tech_gadget_store.dto.request;

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
public class AddressRequestDto {

    @NotBlank(message = "street must not be blank")
    private String street;
    @NotBlank(message = "ward must not be blank")
    private String ward;
    @NotBlank(message = "district must not be blank")
    private String district;
    @NotBlank(message = "province must not be blank")
    private String province;
    @NotBlank(message = "userId must not be blank")
    private String userId;
}
