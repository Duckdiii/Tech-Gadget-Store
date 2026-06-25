package com.project.tech_gadget_store.controller;

import tools.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.dto.request.AddToCartRequestDto;
import com.project.tech_gadget_store.dto.request.UpdateCartItemBundleServicesRequestDto;
import com.project.tech_gadget_store.dto.request.UpdateCartItemQuantityRequestDto;
import com.project.tech_gadget_store.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.dto.response.CartDetailResponseDto;
import com.project.tech_gadget_store.entity.enums.BundleServiceType;
import com.project.tech_gadget_store.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CartService cartService;

    @InjectMocks
    private CartController cartController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(cartController).build();
    }

    @Test
    void getCart_Success() throws Exception {
        String email = "customer@example.com";
        CartDetailResponseDto responseDto = CartDetailResponseDto.builder()
                .cartId("cart-123")
                .total(BigDecimal.ZERO)
                .build();

        when(cartService.getCart(email)).thenReturn(responseDto);

        mockMvc.perform(get("/api/customer/cart")
                        .principal(new UsernamePasswordAuthenticationToken(email, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-123"));
    }

    @Test
    void addToCart_Success() throws Exception {
        String email = "customer@example.com";
        AddToCartRequestDto requestDto = AddToCartRequestDto.builder()
                .productVariantId("var-123")
                .quantity(2)
                .build();

        CartDetailResponseDto responseDto = CartDetailResponseDto.builder()
                .cartId("cart-123")
                .total(BigDecimal.ZERO)
                .build();

        when(cartService.addToCart(any(AddToCartRequestDto.class), eq(email))).thenReturn(responseDto);

        mockMvc.perform(post("/api/customer/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .principal(new UsernamePasswordAuthenticationToken(email, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-123"));
    }

    @Test
    void updateQuantity_Success() throws Exception {
        String email = "customer@example.com";
        String cartItemId = "item-123";
        UpdateCartItemQuantityRequestDto requestDto = UpdateCartItemQuantityRequestDto.builder()
                .quantity(3)
                .build();

        CartDetailResponseDto responseDto = CartDetailResponseDto.builder()
                .cartId("cart-123")
                .total(BigDecimal.ZERO)
                .build();

        when(cartService.updateQuantity(eq(cartItemId), eq(3), eq(email))).thenReturn(responseDto);

        mockMvc.perform(put("/api/customer/cart/items/item-123/quantity")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .principal(new UsernamePasswordAuthenticationToken(email, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-123"));
    }

    @Test
    void removeItem_Success() throws Exception {
        String email = "customer@example.com";
        String cartItemId = "item-123";

        CartDetailResponseDto responseDto = CartDetailResponseDto.builder()
                .cartId("cart-123")
                .total(BigDecimal.ZERO)
                .build();

        when(cartService.removeItem(eq(cartItemId), eq(email))).thenReturn(responseDto);

        mockMvc.perform(delete("/api/customer/cart/items/item-123")
                        .principal(new UsernamePasswordAuthenticationToken(email, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-123"));
    }

    @Test
    void getAvailableBundleServices_Success() throws Exception {
        String cartItemId = "item-123";
        String email = "customer@example.com";

        BundleServiceResponseDto responseDto = BundleServiceResponseDto.builder()
                .id("service-123")
                .name("Warranty Extension")
                .type(BundleServiceType.WARRANTY)
                .price(BigDecimal.valueOf(99.99))
                .active(true)
                .build();

        when(cartService.getAvailableBundleServices(eq(cartItemId), eq(email))).thenReturn(List.of(responseDto));

        mockMvc.perform(get("/api/customer/cart/items/item-123/bundle-services")
                        .principal(new UsernamePasswordAuthenticationToken(email, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("service-123"))
                .andExpect(jsonPath("$[0].name").value("Warranty Extension"))
                .andExpect(jsonPath("$[0].price").value(99.99));
    }

    @Test
    void updateBundleServices_Success() throws Exception {
        String cartItemId = "item-123";
        String email = "customer@example.com";

        UpdateCartItemBundleServicesRequestDto requestDto = UpdateCartItemBundleServicesRequestDto.builder()
                .bundleServicesIds(List.of("service-123"))
                .build();

        CartDetailResponseDto responseDto = CartDetailResponseDto.builder()
                .cartId("cart-123")
                .total(BigDecimal.valueOf(1099.99))
                .build();

        when(cartService.updateBundleServices(eq(cartItemId), eq(List.of("service-123")), eq(email))).thenReturn(responseDto);

        mockMvc.perform(put("/api/customer/cart/items/item-123/bundle-services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .principal(new UsernamePasswordAuthenticationToken(email, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-123"))
                .andExpect(jsonPath("$.total").value(1099.99));
    }
}
