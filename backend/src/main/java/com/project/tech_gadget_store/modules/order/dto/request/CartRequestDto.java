package com.project.tech_gadget_store.modules.order.dto.request;

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
public class CartRequestDto {

    @NotBlank(message = "customerId must not be blank")
    private String customerId;
}
