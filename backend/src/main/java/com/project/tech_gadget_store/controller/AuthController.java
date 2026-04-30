package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.LoginRequest;
import com.project.tech_gadget_store.dto.request.RegisterRequest;
import com.project.tech_gadget_store.dto.response.LoginResponse;
import com.project.tech_gadget_store.dto.response.RegisterResponse;
import com.project.tech_gadget_store.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AccountService accountService;

    @PostMapping("/register")
    public Mono<ResponseEntity<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return accountService.register(request)
                .map(response -> ResponseEntity.status(HttpStatus.CREATED).body(response));
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return accountService.login(request)
                .map(ResponseEntity::ok);
    }
}
