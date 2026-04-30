package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.LoginRequest;
import com.project.tech_gadget_store.dto.request.RegisterRequest;
import com.project.tech_gadget_store.dto.response.LoginResponse;
import com.project.tech_gadget_store.dto.response.RegisterResponse;
import reactor.core.publisher.Mono;

public interface AccountService {

    Mono<LoginResponse> login(LoginRequest request);

    Mono<RegisterResponse> register(RegisterRequest request);
}
