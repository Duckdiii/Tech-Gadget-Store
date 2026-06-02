package com.project.tech_gadget_store.dto.request;

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

    private String terminalCode;
    private String endpointUrl;
    private String returnUrl;
    private String hashSecret;
}
