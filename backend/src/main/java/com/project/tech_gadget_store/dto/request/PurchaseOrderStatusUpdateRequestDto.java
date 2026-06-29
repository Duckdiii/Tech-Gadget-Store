package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.PurchaseOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PurchaseOrderStatusUpdateRequestDto {

    @NotNull(message = "status is required")
    private PurchaseOrderStatus status;
}
