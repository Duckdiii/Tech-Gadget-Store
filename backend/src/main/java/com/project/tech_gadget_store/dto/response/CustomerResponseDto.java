package com.project.tech_gadget_store.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fullName;
    private String phone;
    private String address;
    private String cartId;
    private List<String> ordersIds;
    private List<String> productSubscriptionsIds;
}
