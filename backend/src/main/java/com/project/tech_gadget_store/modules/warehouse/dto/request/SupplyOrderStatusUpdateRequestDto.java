package com.project.tech_gadget_store.modules.warehouse.dto.request;

import com.project.tech_gadget_store.common.entity.enums.POStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class SupplyOrderStatusUpdateRequestDto {

    @NotNull(message = "status is required")
    private POStatus status;
}
