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
public class VNPayPaymentMethodRequestDto {

    @NotBlank(message = "terminalCode must not be blank")
    private String terminalCode;
    @NotBlank(message = "endpointUrl must not be blank")
    private String endpointUrl;
    @NotBlank(message = "returnUrl must not be blank")
    private String returnUrl;
    @NotBlank(message = "hashSecret must not be blank")
    private String hashSecret;
}
