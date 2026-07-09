package com.project.tech_gadget_store.modules.loyalty.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceInUseException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.loyalty.dto.request.MembershipRequestDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.MembershipResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.MembershipBenefit;
import com.project.tech_gadget_store.modules.loyalty.mapper.MembershipMapper;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MembershipManagementService {

    private final MembershipRepository membershipRepository;
    private final MembershipMapper membershipMapper;

    @Transactional
    public MembershipResponseDto createMembership(MembershipRequestDto dto) {
        if (membershipRepository.findByTier(dto.getTier()).isPresent()) {
            throw new DuplicateResourceException("A membership tier already exists for: " + dto.getTier());
        }
        MembershipBenefit benefit = new MembershipBenefit(
                dto.getBenefit().getDiscountPercentage(),
                dto.getBenefit().getFreeShipping(),
                dto.getBenefit().getDescription());
        Membership membership = new Membership(dto.getTier(), benefit, dto.getMinSpending(), dto.getMaxSpending());
        return membershipMapper.toMembershipResponseDto(membershipRepository.save(membership));
    }

    @Transactional
    public MembershipResponseDto updateMembership(String id, MembershipRequestDto dto) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership tier not found with id: " + id));

        membership.changeSpendingRange(dto.getMinSpending(), dto.getMaxSpending());

        MembershipBenefit benefit = membership.getBenefit();
        benefit.changeDiscountPercentage(dto.getBenefit().getDiscountPercentage());
        if (Boolean.TRUE.equals(dto.getBenefit().getFreeShipping())) {
            benefit.enableFreeShipping();
        } else {
            benefit.disableFreeShipping();
        }
        benefit.setDescription(dto.getBenefit().getDescription());

        return membershipMapper.toMembershipResponseDto(membershipRepository.save(membership));
    }

    @Transactional
    public void removeMembership(String id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership tier not found with id: " + id));
        if (!membership.getCustomers().isEmpty()) {
            throw new ResourceInUseException(
                    "Cannot remove a membership tier that still has customers assigned to it");
        }
        membershipRepository.delete(membership);
    }

    public List<MembershipResponseDto> getAllMemberships() {
        return membershipRepository.findAll().stream()
                .map(membershipMapper::toMembershipResponseDto)
                .toList();
    }
}
