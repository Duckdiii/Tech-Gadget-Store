package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

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

    @NotBlank(message = "customerId must not be blank")
    private String customerId;
    @NotBlank(message = "addressId must not be blank")
    private String addressId;
    @NotBlank(message = "selectedPaymentMethodId must not be blank")
    private String selectedPaymentMethodId;
    private LocalDateTime orderDate;
    private LocalDateTime paidAt;
    @NotNull(message = "orderStatus must not be null")
    private OrderStatus orderStatus;
}
