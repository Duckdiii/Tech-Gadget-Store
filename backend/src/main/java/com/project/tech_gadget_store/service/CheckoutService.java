package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.CheckoutRequest;
import com.project.tech_gadget_store.dto.response.CheckoutResponse;

import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CheckoutService {
    Mono<CheckoutResponse> processCheckout(UUID accountId, CheckoutRequest request);
}
