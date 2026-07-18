package com.project.tech_gadget_store.modules.auth.dto.response;

import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.order.dto.response.OrderHistoryResponseDto;
import java.math.BigDecimal;
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
public class CustomerDetailResponseDto {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private MembershipTier tier;
    private long totalOrders;
    private BigDecimal totalSpend;
    private long returnedOrders;
    private LocalDateTime lastPurchaseDate;
    private LocalDateTime joinDate;
    private List<OrderHistoryResponseDto> recentOrders;
    private String accountId;
    private String accountStatus;
    private List<PurchasedProductDto> purchasedProducts;
    private List<CustomerNoteResponseDto> notes;
    private BigDecimal minSpending;
    private BigDecimal maxSpending;
    private MembershipTier nextTier;
    private BigDecimal nextTierMinSpending;
    private BigDecimal amountToNextTier;
    private List<BigDecimal> monthlySpending;
}
