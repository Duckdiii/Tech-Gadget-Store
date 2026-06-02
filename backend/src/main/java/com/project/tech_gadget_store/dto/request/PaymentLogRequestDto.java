package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
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
public class PaymentLogRequestDto {

    private String orderId;
    private PaymentLogStatus status;
    private String failureReason;
}
