package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
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
public class OrderResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String customerId;
    private String addressId;
    private List<String> itemsIds;
    private String selectedPaymentMethodId;
    private LocalDateTime orderDate;
    private LocalDateTime paidAt;
    private OrderStatus orderStatus;
    private String invoiceId;
    private List<String> paymentLogsIds;
}
