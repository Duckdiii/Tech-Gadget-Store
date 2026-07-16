package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.dto.response.AccountResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.Manager;
import com.project.tech_gadget_store.modules.auth.entity.Staff;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.LoginLogRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private LoginLogRepository loginLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountService accountService;

    private Account staffAccount() {
        Staff staff = new Staff("Nguyen Van A", "0900000001", "STF001", LocalDate.now());
        staff.setId("staff-1");
        Account account = new Account("staff@techstore.vn", "hashed", staff, AccountStatus.ACTIVE);
        account.setId("acc-1");
        return account;
    }

    @Test
    void blockAccountById_found_setsStatusBlockedAndSaves() {
        Account account = staffAccount();
        when(accountRepository.findById("acc-1")).thenReturn(Optional.of(account));

        AccountResponseDto result = accountService.blockAccountById("acc-1");

        assertThat(account.getStatus()).isEqualTo(AccountStatus.BLOCKED);
        assertThat(result.getStatus()).isEqualTo(AccountStatus.BLOCKED);
        verify(accountRepository).save(account);
    }

    @Test
    void blockAccountById_notFound_throwsResourceNotFoundException() {
        when(accountRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.blockAccountById("missing"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(accountRepository, never()).save(any());
    }

    @Test
    void unblockAccountById_found_setsStatusActiveAndSaves() {
        Account account = staffAccount();
        account.setStatus(AccountStatus.BLOCKED);
        when(accountRepository.findById("acc-1")).thenReturn(Optional.of(account));

        AccountResponseDto result = accountService.unblockAccountById("acc-1");

        assertThat(account.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(result.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    void unblockAccountById_notFound_throwsResourceNotFoundException() {
        when(accountRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.unblockAccountById("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createStaffAccount_emailAlreadyExists_throwsDuplicateResourceException() {
        Staff staff = new Staff("Nguyen Van A", "0900000001", "STF001", LocalDate.now());
        when(accountRepository.existsByEmail("staff@techstore.vn")).thenReturn(true);

        assertThatThrownBy(() -> accountService.createStaffAccount("staff@techstore.vn", "raw-pass", staff))
                .isInstanceOf(DuplicateResourceException.class);

        verify(accountRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void createStaffAccount_newEmail_encodesPasswordAndSaves() {
        Staff staff = new Staff("Nguyen Van A", "0900000001", "STF001", LocalDate.now());
        when(accountRepository.existsByEmail("staff@techstore.vn")).thenReturn(false);
        when(passwordEncoder.encode("raw-pass")).thenReturn("hashed-pass");
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));

        Account result = accountService.createStaffAccount("staff@techstore.vn", "raw-pass", staff);

        assertThat(result.getPassword()).isEqualTo("hashed-pass");
        assertThat(result.getUser()).isEqualTo(staff);
        assertThat(result.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    void deleteStaffAccount_accountIsStaff_deletesLoginLogsThenAccount() {
        Account account = staffAccount();

        accountService.deleteStaffAccount(account);

        verify(loginLogRepository).deleteByAccountId("acc-1");
        verify(accountRepository).delete(account);
    }

    @Test
    void deleteStaffAccount_accountIsNotStaff_throwsIllegalStateException() {
        Manager manager = new Manager("Nguyen Van B", "0900000002");
        Account account = new Account("manager@techstore.vn", "hashed", manager, AccountStatus.ACTIVE);
        account.setId("acc-2");

        assertThatThrownBy(() -> accountService.deleteStaffAccount(account))
                .isInstanceOf(IllegalStateException.class);

        verify(accountRepository, never()).delete(any());
        verify(loginLogRepository, never()).deleteByAccountId(any());
    }

    @Test
    void deleteStaffAccount_nullAccount_throwsResourceNotFoundException() {
        assertThatThrownBy(() -> accountService.deleteStaffAccount(null))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
