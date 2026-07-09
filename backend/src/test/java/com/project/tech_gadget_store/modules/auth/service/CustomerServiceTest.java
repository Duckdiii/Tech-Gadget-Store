package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.mapper.AddressMapper;
import com.project.tech_gadget_store.modules.auth.mapper.CustomerMapper;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.loyalty.dto.response.CustomerMembershipResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.MembershipBenefit;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.loyalty.mapper.MembershipMapper;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
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
import static org.mockito.Mockito.when;




@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerMapper customerMapper;

    @Mock
    private MembershipMapper membershipMapper;

    @Mock
    private AddressMapper addressMapper;

    @InjectMocks
    private CustomerService customerService;

    private Membership membership(MembershipTier tier, String min, String max) {
        MembershipBenefit benefit = new MembershipBenefit(5.0, true, "desc");
        Membership m = new Membership(tier, benefit,
                min == null ? null : new BigDecimal(min), max == null ? null : new BigDecimal(max));
        return m;
    }

    @Test
    void getMyMembership_computesNextTierAndRemainingAmount() {
        Membership silver = membership(MembershipTier.SILVER, "5000000", "20000000");
        Membership gold = membership(MembershipTier.GOLD, "20000000", "50000000");

        Customer customer = new Customer("Alice", "0900000000", silver);
        customer.setId("cust-1");

        when(customerRepository.findByAccountEmail("alice@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.sumSpentByCustomerIdAndStatus("cust-1", OrderStatus.COMPLETED))
                .thenReturn(new BigDecimal("12000000"));
        when(membershipRepository.findAll()).thenReturn(List.of(silver, gold));

        CustomerMembershipResponseDto result = customerService.getMyMembership("alice@test.com");

        assertThat(result.getTier()).isEqualTo(MembershipTier.SILVER);
        assertThat(result.getTotalSpent()).isEqualByComparingTo("12000000");
        assertThat(result.getNextTier()).isEqualTo(MembershipTier.GOLD);
        assertThat(result.getAmountToNextTier()).isEqualByComparingTo("8000000");
    }

    @Test
    void getMyMembership_topTier_noNextTier() {
        Membership diamond = membership(MembershipTier.DIAMOND, "100000000", null);
        Customer customer = new Customer("Bob", "0900000001", diamond);
        customer.setId("cust-2");

        when(customerRepository.findByAccountEmail("bob@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.sumSpentByCustomerIdAndStatus("cust-2", OrderStatus.COMPLETED))
                .thenReturn(new BigDecimal("150000000"));
        when(membershipRepository.findAll()).thenReturn(List.of(diamond));

        CustomerMembershipResponseDto result = customerService.getMyMembership("bob@test.com");

        assertThat(result.getNextTier()).isNull();
        assertThat(result.getAmountToNextTier()).isNull();
    }

    @Test
    void getMyMembership_customerNotFound_throwsResourceNotFoundException() {
        when(customerRepository.findByAccountEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getMyMembership("missing@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
