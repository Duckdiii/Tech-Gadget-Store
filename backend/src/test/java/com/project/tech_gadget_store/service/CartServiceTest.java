package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.AddToCartRequestDto;
import com.project.tech_gadget_store.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.dto.response.CartDetailResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.BundleServiceType;
import com.project.tech_gadget_store.exception.CartUpdateException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.CartMapper;
import com.project.tech_gadget_store.repository.BundleServiceRepository;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    private CartService cartService;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private BundleServiceRepository bundleServiceRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    private final CartMapper cartMapper = new CartMapper();

    @BeforeEach
    void setUp() {
        cartService = new CartService(customerRepository, bundleServiceRepository, productVariantRepository, cartMapper);
    }

    @Test
    void getCart_Success() {
        String email = "customer@example.com";
        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getId()).thenReturn("cart-123");
        when(cart.getItems()).thenReturn(Collections.emptyList());
        when(cart.calculateTotal()).thenReturn(BigDecimal.ZERO);

        CartDetailResponseDto result = cartService.getCart(email);

        assertNotNull(result);
        assertEquals("cart-123", result.getCartId());
        assertEquals(BigDecimal.ZERO, result.getTotal());
        verify(customer).createCartIfAbsent();
    }

    @Test
    void addToCart_Success_NewItem() {
        String email = "customer@example.com";
        AddToCartRequestDto req = AddToCartRequestDto.builder()
                .productVariantId("var-123")
                .quantity(2)
                .build();

        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        ProductVariant variant = mock(ProductVariant.class);
        Product product = mock(Product.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(productVariantRepository.findById("var-123")).thenReturn(Optional.of(variant));
        
        when(variant.getProduct()).thenReturn(product);
        when(product.getId()).thenReturn("prod-1");
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Black");

        List<ProductVariant> available = List.of(mock(ProductVariant.class), mock(ProductVariant.class));
        when(productVariantRepository.findAvailablePhysicalUnits("prod-1", 8, 256, "Black")).thenReturn(available);

        when(cart.getItems()).thenReturn(new ArrayList<>());
        when(cart.getId()).thenReturn("cart-123");
        when(cart.calculateTotal()).thenReturn(BigDecimal.ZERO);

        CartDetailResponseDto result = cartService.addToCart(req, email);

        assertNotNull(result);
        verify(customerRepository).save(customer);
    }

    @Test
    void addToCart_OutOfStock_ThrowsIllegalArgumentException() {
        String email = "customer@example.com";
        AddToCartRequestDto req = AddToCartRequestDto.builder()
                .productVariantId("var-123")
                .quantity(3)
                .build();

        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        ProductVariant variant = mock(ProductVariant.class);
        Product product = mock(Product.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(productVariantRepository.findById("var-123")).thenReturn(Optional.of(variant));
        
        when(variant.getProduct()).thenReturn(product);
        when(product.getId()).thenReturn("prod-1");
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Black");

        List<ProductVariant> available = List.of(mock(ProductVariant.class), mock(ProductVariant.class));
        when(productVariantRepository.findAvailablePhysicalUnits("prod-1", 8, 256, "Black")).thenReturn(available);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                cartService.addToCart(req, email));
        assertEquals("This product is currently out of stock.", ex.getMessage());
    }

    @Test
    void updateQuantity_Success() {
        String email = "customer@example.com";
        String cartItemId = "item-123";
        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);
        ProductVariant variant = mock(ProductVariant.class);
        Product product = mock(Product.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);
        when(cartItem.getProductVariant()).thenReturn(variant);

        when(variant.getProduct()).thenReturn(product);
        when(product.getId()).thenReturn("prod-1");
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Black");

        List<ProductVariant> available = List.of(mock(ProductVariant.class), mock(ProductVariant.class));
        when(productVariantRepository.findAvailablePhysicalUnits("prod-1", 8, 256, "Black")).thenReturn(available);

        when(cart.getId()).thenReturn("cart-123");
        when(cart.calculateTotal()).thenReturn(BigDecimal.ZERO);

        CartDetailResponseDto result = cartService.updateQuantity(cartItemId, 2, email);

        assertNotNull(result);
        verify(cartItem).changeQuantity(2);
        verify(customerRepository).save(customer);
    }

    @Test
    void updateQuantity_InvalidQuantity_ThrowsIllegalArgumentException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                cartService.updateQuantity("item-123", 0, "customer@example.com"));
        assertEquals("Invalid quantity. Please enter a valid quantity.", ex.getMessage());
    }

    @Test
    void removeItem_Success() {
        String email = "customer@example.com";
        String cartItemId = "item-123";
        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);

        when(cart.getId()).thenReturn("cart-123");
        when(cart.calculateTotal()).thenReturn(BigDecimal.ZERO);

        CartDetailResponseDto result = cartService.removeItem(cartItemId, email);

        assertNotNull(result);
        verify(cart).removeItem(cartItem);
        verify(customerRepository).save(customer);
    }

    @Test
    void getAvailableBundleServices_Success() {
        String email = "customer@example.com";
        String cartItemId = "item-123";

        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);
        BundleService activeService = mock(BundleService.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);

        when(bundleServiceRepository.findByActiveTrue()).thenReturn(List.of(activeService));
        when(activeService.getId()).thenReturn("service-1");
        when(activeService.getName()).thenReturn("Warranty Extension");
        when(activeService.getType()).thenReturn(BundleServiceType.WARRANTY);
        when(activeService.getPrice()).thenReturn(BigDecimal.valueOf(99.99));
        when(activeService.getActive()).thenReturn(true);

        List<BundleServiceResponseDto> result = cartService.getAvailableBundleServices(cartItemId, email);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("service-1", result.get(0).getId());
        assertEquals("Warranty Extension", result.get(0).getName());
    }

    @Test
    void getAvailableBundleServices_CustomerNotFound_ThrowsResourceNotFoundException() {
        String email = "nonexistent@example.com";
        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                cartService.getAvailableBundleServices("item-1", email));
    }

    @Test
    void getAvailableBundleServices_CartEmpty_ThrowsIllegalArgumentException() {
        String email = "customer@example.com";
        Customer customer = mock(Customer.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                cartService.getAvailableBundleServices("item-1", email));
        assertTrue(ex.getMessage().contains("must have at least one item"));
    }

    @Test
    void getAvailableBundleServices_CartItemNotFound_ThrowsResourceNotFoundException() {
        String email = "customer@example.com";
        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn("other-item");

        assertThrows(ResourceNotFoundException.class, () ->
                cartService.getAvailableBundleServices("item-1", email));
    }

    @Test
    void getAvailableBundleServices_NoActiveBundleServices_ThrowsIllegalArgumentException() {
        String email = "customer@example.com";
        String cartItemId = "item-1";
        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);
        when(bundleServiceRepository.findByActiveTrue()).thenReturn(Collections.emptyList());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                cartService.getAvailableBundleServices(cartItemId, email));
        assertTrue(ex.getMessage().contains("No active bundle services"));
    }

    @Test
    void updateBundleServices_Success_AddServices() {
        String email = "customer@example.com";
        String cartItemId = "item-123";

        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);
        BundleService warranty = mock(BundleService.class);
        ProductVariant variant = mock(ProductVariant.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);

        List<BundleService> activeServices = List.of(warranty);
        when(bundleServiceRepository.findByActiveTrue()).thenReturn(activeServices);

        List<BundleService> itemServices = new ArrayList<>();
        when(cartItem.getBundleServices()).thenReturn(itemServices);
        doAnswer(invocation -> {
            itemServices.add(invocation.getArgument(0));
            return null;
        }).when(cartItem).addBundleService(any(BundleService.class));

        when(bundleServiceRepository.findById("service-1")).thenReturn(Optional.of(warranty));
        when(warranty.isActive()).thenReturn(true);
        when(warranty.getId()).thenReturn("service-1");
        when(warranty.getName()).thenReturn("Warranty Extension");
        when(warranty.getType()).thenReturn(BundleServiceType.WARRANTY);
        when(warranty.getPrice()).thenReturn(BigDecimal.valueOf(99.99));
        when(warranty.getActive()).thenReturn(true);

        when(cartItem.getProductVariant()).thenReturn(variant);
        when(cartItem.getQuantity()).thenReturn(1);
        when(cartItem.getUnitPrice()).thenReturn(BigDecimal.valueOf(1000.00));
        when(cartItem.calculateSubtotal()).thenReturn(BigDecimal.valueOf(1099.99));
        when(cart.calculateTotal()).thenReturn(BigDecimal.valueOf(1099.99));
        when(cart.getId()).thenReturn("cart-1");

        CartDetailResponseDto result = cartService.updateBundleServices(cartItemId, List.of("service-1"), email);

        assertNotNull(result);
        assertEquals("cart-1", result.getCartId());
        assertEquals(BigDecimal.valueOf(1099.99), result.getTotal());
        assertEquals(1, result.getItems().size());
        assertEquals("service-1", result.getItems().get(0).getBundleServices().get(0).getId());

        verify(customerRepository).save(customer);
    }

    @Test
    void updateBundleServices_Success_RemoveServices() {
        String email = "customer@example.com";
        String cartItemId = "item-123";

        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);
        BundleService warranty = mock(BundleService.class);
        ProductVariant variant = mock(ProductVariant.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);

        when(bundleServiceRepository.findByActiveTrue()).thenReturn(List.of(warranty));

        List<BundleService> itemServices = new ArrayList<>();
        itemServices.add(warranty);
        when(cartItem.getBundleServices()).thenReturn(itemServices);

        when(cartItem.getProductVariant()).thenReturn(variant);
        when(cartItem.getQuantity()).thenReturn(1);
        when(cartItem.getUnitPrice()).thenReturn(BigDecimal.valueOf(1000.00));
        when(cartItem.calculateSubtotal()).thenReturn(BigDecimal.valueOf(1000.00));
        when(cart.calculateTotal()).thenReturn(BigDecimal.valueOf(1000.00));
        when(cart.getId()).thenReturn("cart-1");

        CartDetailResponseDto result = cartService.updateBundleServices(cartItemId, Collections.emptyList(), email);

        assertNotNull(result);
        assertTrue(result.getItems().get(0).getBundleServices().isEmpty());
        verify(customerRepository).save(customer);
    }

    @Test
    void updateBundleServices_InactiveBundleService_ThrowsIllegalArgumentException() {
        String email = "customer@example.com";
        String cartItemId = "item-123";

        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);
        BundleService inactiveService = mock(BundleService.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);

        when(bundleServiceRepository.findByActiveTrue()).thenReturn(List.of(inactiveService));
        when(cartItem.getBundleServices()).thenReturn(new ArrayList<>());

        when(bundleServiceRepository.findById("service-inactive")).thenReturn(Optional.of(inactiveService));
        when(inactiveService.isActive()).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                cartService.updateBundleServices(cartItemId, List.of("service-inactive"), email));
        assertEquals("This bundle service is currently unavailable", ex.getMessage());
    }

    @Test
    void updateBundleServices_DatabaseError_ThrowsCartUpdateException() {
        String email = "customer@example.com";
        String cartItemId = "item-123";

        Customer customer = mock(Customer.class);
        Cart cart = mock(Cart.class);
        CartItem cartItem = mock(CartItem.class);
        BundleService warranty = mock(BundleService.class);

        when(customerRepository.findByAccountEmail(email)).thenReturn(Optional.of(customer));
        when(customer.getCart()).thenReturn(cart);
        when(cart.getItems()).thenReturn(List.of(cartItem));
        when(cartItem.getId()).thenReturn(cartItemId);

        when(bundleServiceRepository.findByActiveTrue()).thenReturn(List.of(warranty));
        when(cartItem.getBundleServices()).thenReturn(new ArrayList<>());

        when(bundleServiceRepository.findById("service-1")).thenReturn(Optional.of(warranty));
        when(warranty.isActive()).thenReturn(true);

        doThrow(new RuntimeException("DB Conn Failed")).when(customerRepository).save(any(Customer.class));

        CartUpdateException ex = assertThrows(CartUpdateException.class, () ->
                cartService.updateBundleServices(cartItemId, List.of("service-1"), email));
        assertEquals("Unable to add bundle service. Please try again later", ex.getMessage());
    }
}
