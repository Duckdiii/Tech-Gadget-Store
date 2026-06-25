package com.project.tech_gadget_store.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentLogFilterRequestDto {
    private String startDate;
    private String endDate;
    private String status;
    private String paymentMethod;
}
