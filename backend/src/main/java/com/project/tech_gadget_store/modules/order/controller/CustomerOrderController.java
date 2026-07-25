package com.project.tech_gadget_store.modules.order.controller;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.AddressResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderHistoryResponseDto;
import com.project.tech_gadget_store.modules.order.service.OrderService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/customer")
public class CustomerOrderController {

    private final OrderService orderService;

    public CustomerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public ResponseEntity<CursorPageResponseDto<OrderHistoryResponseDto>> getCustomerOrders(
            Authentication authentication,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(orderService.getCustomerOrders(authentication.getName(), cursor, limit));
    }

    @Transactional
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<OrderHistoryResponseDto> cancelCustomerOrder(
            @PathVariable String orderId,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.cancelCustomerOrder(authentication.getName(), orderId));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressResponseDto>> getCustomerAddresses(Authentication authentication) {
        return ResponseEntity.ok(orderService.getCustomerAddresses(authentication.getName()));
    }
}
