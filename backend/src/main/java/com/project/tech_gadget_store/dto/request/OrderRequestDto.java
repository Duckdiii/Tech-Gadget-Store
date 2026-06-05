package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import java.time.LocalDateTime;
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
public class OrderRequestDto {

    private String customerId;
    private String addressId;
    private String selectedPaymentMethodId;
    private LocalDateTime orderDate;
    private LocalDateTime paidAt;
    private OrderStatus orderStatus;
}
