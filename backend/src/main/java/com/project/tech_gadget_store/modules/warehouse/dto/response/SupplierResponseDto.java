package com.project.tech_gadget_store.modules.warehouse.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;



@Getter
@Builder
public class SupplierResponseDto {

    private String id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private Boolean isActive;
    private Boolean hasActiveSupplyOrders;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
