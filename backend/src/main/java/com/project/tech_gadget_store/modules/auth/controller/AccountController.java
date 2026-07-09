package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.modules.auth.dto.response.AccountResponseDto;
import com.project.tech_gadget_store.modules.auth.service.AccountService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/manager/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<AccountResponseDto>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<AccountResponseDto> blockAccount(@PathVariable String id) {
        return ResponseEntity.ok(accountService.blockAccountById(id));
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<AccountResponseDto> unblockAccount(@PathVariable String id) {
        return ResponseEntity.ok(accountService.unblockAccountById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String id) {
        accountService.deleteAccountById(id);
        return ResponseEntity.noContent().build();
    }
}
