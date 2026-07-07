package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.MembershipBenefitResponseDto;
import com.project.tech_gadget_store.dto.response.MembershipResponseDto;
import com.project.tech_gadget_store.dto.response.MembershipTierResponseDto;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.Membership;
import com.project.tech_gadget_store.entity.MembershipBenefit;
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
                .benefit(toBenefitResponseDto(m.getBenefit()))
                .minSpending(m.getMinSpending())
                .maxSpending(m.getMaxSpending())
                .customersIds(m.getCustomers().stream().map(Customer::getId).toList())
                .build();
    }

    public MembershipTierResponseDto toTierResponseDto(Membership m) {
        return MembershipTierResponseDto.builder()
                .tier(m.getTier())
                .minSpending(m.getMinSpending())
                .maxSpending(m.getMaxSpending())
                .discountPercentage(m.getBenefit().getDiscountPercentage())
                .freeShipping(m.getBenefit().getFreeShipping())
                .description(m.getBenefit().getDescription())
                .build();
    }

    public MembershipBenefitResponseDto toBenefitResponseDto(MembershipBenefit b) {
        return MembershipBenefitResponseDto.builder()
                .id(b.getId())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .discountPercentage(b.getDiscountPercentage())
                .freeShipping(b.getFreeShipping())
                .description(b.getDescription())
                .build();
    }
}
