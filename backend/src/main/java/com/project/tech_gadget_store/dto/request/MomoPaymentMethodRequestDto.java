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
public class MomoPaymentMethodRequestDto {

    @NotBlank(message = "partnerCode must not be blank")
    private String partnerCode;
    @NotBlank(message = "merchantId must not be blank")
    private String merchantId;
    @NotBlank(message = "endpointUrl must not be blank")
    private String endpointUrl;
    @NotBlank(message = "returnUrl must not be blank")
    private String returnUrl;
    @NotBlank(message = "notifyUrl must not be blank")
    private String notifyUrl;
}
