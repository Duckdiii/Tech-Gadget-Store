package com.project.tech_gadget_store.modules.loyalty.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceInUseException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.loyalty.dto.request.MembershipBenefitRequestDto;
import com.project.tech_gadget_store.modules.loyalty.dto.request.MembershipRequestDto;
import com.project.tech_gadget_store.modules.loyalty.dto.response.MembershipResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.MembershipBenefit;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.loyalty.mapper.MembershipMapper;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;




@ExtendWith(MockitoExtension.class)
class MembershipManagementServiceTest {

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private MembershipMapper membershipMapper;

    @InjectMocks
    private MembershipManagementService membershipManagementService;

    private MembershipRequestDto validDto() {
        MembershipRequestDto dto = new MembershipRequestDto();
        dto.setTier(MembershipTier.GOLD);
        dto.setMinSpending(new BigDecimal("20000000"));
        dto.setMaxSpending(new BigDecimal("50000000"));
        MembershipBenefitRequestDto benefit = new MembershipBenefitRequestDto();
        benefit.setDiscountPercentage(5.0);
        benefit.setFreeShipping(true);
        benefit.setDescription("Gold tier benefits");
        dto.setBenefit(benefit);
        return dto;
    }

    @Test
    void createMembership_success() {
        MembershipRequestDto dto = validDto();
        when(membershipRepository.findByTier(MembershipTier.GOLD)).thenReturn(Optional.empty());
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipMapper.toMembershipResponseDto(any(Membership.class)))
                .thenReturn(MembershipResponseDto.builder().tier(MembershipTier.GOLD).build());

        MembershipResponseDto result = membershipManagementService.createMembership(dto);

        assertThat(result.getTier()).isEqualTo(MembershipTier.GOLD);
        verify(membershipRepository).save(any(Membership.class));
    }

    @Test
    void createMembership_tierAlreadyExists_throwsDuplicateResourceException() {
        MembershipRequestDto dto = validDto();
        when(membershipRepository.findByTier(MembershipTier.GOLD))
                .thenReturn(Optional.of(mock(Membership.class)));

        assertThatThrownBy(() -> membershipManagementService.createMembership(dto))
                .isInstanceOf(DuplicateResourceException.class);

        verify(membershipRepository, never()).save(any());
    }

    @Test
    void updateMembership_success() {
        MembershipBenefit benefit = new MembershipBenefit(2.0, false, "Old desc");
        Membership existing = new Membership(MembershipTier.GOLD, benefit, new BigDecimal("20000000"), new BigDecimal("50000000"));
        existing.setId("mem-1");

        MembershipRequestDto dto = validDto();
        dto.getBenefit().setDiscountPercentage(8.0);
        dto.getBenefit().setFreeShipping(true);

        when(membershipRepository.findById("mem-1")).thenReturn(Optional.of(existing));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipMapper.toMembershipResponseDto(any(Membership.class)))
                .thenReturn(MembershipResponseDto.builder().tier(MembershipTier.GOLD).build());

        membershipManagementService.updateMembership("mem-1", dto);

        assertThat(benefit.getDiscountPercentage()).isEqualTo(8.0);
        assertThat(benefit.getFreeShipping()).isTrue();
    }

    @Test
    void updateMembership_notFound_throwsResourceNotFoundException() {
        when(membershipRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> membershipManagementService.updateMembership("missing", validDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeMembership_noCustomers_deletesMembership() {
        MembershipBenefit benefit = new MembershipBenefit(2.0, false, "desc");
        Membership existing = new Membership(MembershipTier.GOLD, benefit, new BigDecimal("20000000"), new BigDecimal("50000000"));
        existing.setId("mem-1");

        when(membershipRepository.findById("mem-1")).thenReturn(Optional.of(existing));

        membershipManagementService.removeMembership("mem-1");

        verify(membershipRepository).delete(existing);
    }

    @Test
    void removeMembership_hasCustomers_throwsResourceInUseException() {
        MembershipBenefit benefit = new MembershipBenefit(2.0, false, "desc");
        Membership existing = new Membership(MembershipTier.GOLD, benefit, new BigDecimal("20000000"), new BigDecimal("50000000"));
        existing.setId("mem-1");
        existing.addCustomer(mock(Customer.class));

        when(membershipRepository.findById("mem-1")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> membershipManagementService.removeMembership("mem-1"))
                .isInstanceOf(ResourceInUseException.class);

        verify(membershipRepository, never()).delete(any());
    }

    @Test
    void getAllMemberships_returnsMappedList() {
        Membership m = new Membership(MembershipTier.GOLD, new MembershipBenefit(2.0, false, "desc"),
                new BigDecimal("20000000"), new BigDecimal("50000000"));
        when(membershipRepository.findAll()).thenReturn(List.of(m));
        when(membershipMapper.toMembershipResponseDto(m))
                .thenReturn(MembershipResponseDto.builder().tier(MembershipTier.GOLD).build());

        List<MembershipResponseDto> result = membershipManagementService.getAllMemberships();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTier()).isEqualTo(MembershipTier.GOLD);
    }
}
