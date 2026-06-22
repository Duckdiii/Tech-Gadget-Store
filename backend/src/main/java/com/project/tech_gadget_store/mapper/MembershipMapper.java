package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.MembershipResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.Membership;
import org.springframework.stereotype.Component;

@Component
public class MembershipMapper {

    public MembershipResponseDto toMembershipResponseDto(Membership m) {
        return MembershipResponseDto.builder()
                .id(m.getId())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .tier(m.getTier())
                .benefitId(m.getBenefit().getId())
                .minSpending(m.getMinSpending())
                .maxSpending(m.getMaxSpending())
                .customersIds(m.getCustomers().stream().map(Customer::getId).toList())
                .build();
    }
}
