package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.AddToCartRequestDto;
import com.project.tech_gadget_store.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.dto.response.CartDetailResponseDto;
import com.project.tech_gadget_store.entity.BundleService;
import com.project.tech_gadget_store.entity.Cart;
import com.project.tech_gadget_store.entity.CartItem;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.exception.CartUpdateException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.CartMapper;
import com.project.tech_gadget_store.repository.BundleServiceRepository;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CartService {

    private final CustomerRepository customerRepository;
    private final BundleServiceRepository bundleServiceRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartMapper cartMapper;

    public CartService(CustomerRepository customerRepository,
                       BundleServiceRepository bundleServiceRepository,
                       ProductVariantRepository productVariantRepository,
                       CartMapper cartMapper) {
        this.customerRepository = customerRepository;
        this.bundleServiceRepository = bundleServiceRepository;
        this.productVariantRepository = productVariantRepository;
        this.cartMapper = cartMapper;
    }

    public CartDetailResponseDto getCart(String customerEmail) {
        Customer customer = customerRepository.findByAccountEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));

        customer.createCartIfAbsent();
        return cartMapper.toCartDetailResponseDto(customer.getCart());
    }

    @Transactional
    public CartDetailResponseDto addToCart(AddToCartRequestDto req, String customerEmail) {
        Customer customer = customerRepository.findByAccountEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));

        customer.createCartIfAbsent();
        Cart cart = customer.getCart();

        ProductVariant referenceVariant = productVariantRepository.findById(req.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found: " + req.getProductVariantId()));

        // Check selected product's availability (available physical units)
        List<ProductVariant> availableUnits = productVariantRepository.findAvailablePhysicalUnits(
                referenceVariant.getProduct().getId(),
                referenceVariant.getRamGb(),
                referenceVariant.getStorageGb(),
                referenceVariant.getColor()
        );

        // Find existing quantity in the cart for the same specifications (and no bundle services)
        int existingQuantity = cart.getItems().stream()
                .filter(item -> isSameSpecification(item.getProductVariant(), referenceVariant))
                .filter(item -> item.getBundleServices() == null || item.getBundleServices().isEmpty())
                .mapToInt(CartItem::getQuantity)
                .sum();

        int totalRequestedQuantity = existingQuantity + req.getQuantity();

        // Exception Flow 2a: Product is out of stock
        if (availableUnits.size() < totalRequestedQuantity) {
            throw new IllegalArgumentException("This product is currently out of stock.");
        }

        // Alternative Flow 2a: Product already exists in the cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> isSameSpecification(item.getProductVariant(), referenceVariant))
                .filter(item -> item.getBundleServices() == null || item.getBundleServices().isEmpty())
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.increaseQuantity(req.getQuantity());
        } else {
            new CartItem(cart, referenceVariant, req.getQuantity());
        }

        try {
            customerRepository.save(customer);
        } catch (Exception e) {
            throw new CartUpdateException("Unable to add product to cart. Please try again later", e);
        }

        return cartMapper.toCartDetailResponseDto(cart);
    }

    @Transactional
    public CartDetailResponseDto updateQuantity(String cartItemId, Integer quantity, String customerEmail) {
        // Exception Flow 5a: Invalid quantity
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Invalid quantity. Please enter a valid quantity.");
        }

        Customer customer = customerRepository.findByAccountEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));

        Cart cart = customer.getCart();
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Customer must have at least one item in the cart");
        }

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        ProductVariant referenceVariant = cartItem.getProductVariant();

        // Check stock availability
        List<ProductVariant> availableUnits = productVariantRepository.findAvailablePhysicalUnits(
                referenceVariant.getProduct().getId(),
                referenceVariant.getRamGb(),
                referenceVariant.getStorageGb(),
                referenceVariant.getColor()
        );

        if (availableUnits.size() < quantity) {
            throw new IllegalArgumentException("This product is currently out of stock.");
        }

        cartItem.changeQuantity(quantity);

        try {
            customerRepository.save(customer);
        } catch (Exception e) {
            throw new CartUpdateException("Unable to update quantity. Please try again later", e);
        }

        return cartMapper.toCartDetailResponseDto(cart);
    }

    @Transactional
    public CartDetailResponseDto removeItem(String cartItemId, String customerEmail) {
        Customer customer = customerRepository.findByAccountEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));

        Cart cart = customer.getCart();
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Customer must have at least one item in the cart");
        }

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        cart.removeItem(cartItem);

        try {
            customerRepository.save(customer);
        } catch (Exception e) {
            throw new CartUpdateException("Unable to remove cart item. Please try again later", e);
        }

        return cartMapper.toCartDetailResponseDto(cart);
    }

    public List<BundleServiceResponseDto> getAvailableBundleServices(String cartItemId, String customerEmail) {
        Customer customer = customerRepository.findByAccountEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));

        Cart cart = customer.getCart();
        // Pre-condition: Actor has at least one item in the cart
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Customer must have at least one item in the cart");
        }

        // Validate that the selected cart item belongs to the customer's cart
        cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found in customer's cart: " + cartItemId));

        // Pre-condition: At least one active bundle service is available in the system
        List<BundleService> activeServices = bundleServiceRepository.findByActiveTrue();
        if (activeServices.isEmpty()) {
            throw new IllegalArgumentException("No active bundle services are available in the system");
        }

        return activeServices.stream()
                .map(cartMapper::toBundleServiceResponseDto)
                .toList();
    }

    @Transactional
    public CartDetailResponseDto updateBundleServices(String cartItemId, List<String> bundleServiceIds, String customerEmail) {
        Customer customer = customerRepository.findByAccountEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));

        Cart cart = customer.getCart();
        // Pre-condition: Actor has at least one item in the cart
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Customer must have at least one item in the cart");
        }

        // Validate that the selected cart item belongs to the customer's cart
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found in customer's cart: " + cartItemId));

        // Pre-condition: At least one active bundle service is available in the system
        List<BundleService> activeServices = bundleServiceRepository.findByActiveTrue();
        if (activeServices.isEmpty()) {
            throw new IllegalArgumentException("No active bundle services are available in the system");
        }

        // Clear existing bundle services and add the validated new ones
        cartItem.getBundleServices().clear();

        if (bundleServiceIds != null && !bundleServiceIds.isEmpty()) {
            for (String bsId : bundleServiceIds) {
                // Fetch bundle service
                BundleService bs = bundleServiceRepository.findById(bsId)
                        .orElseThrow(() -> new IllegalArgumentException("This bundle service is currently unavailable"));
                
                // Exception Flow 4a: Bundle service is inactive
                if (!bs.isActive()) {
                    throw new IllegalArgumentException("This bundle service is currently unavailable");
                }
                
                cartItem.addBundleService(bs);
            }
        }

        // Save cart modifications
        try {
            customerRepository.save(customer);
        } catch (Exception e) {
            // Exception Flow 4b: System/Database fails to update cart item
            throw new CartUpdateException("Unable to add bundle service. Please try again later", e);
        }

        return cartMapper.toCartDetailResponseDto(cart);
    }

    private boolean isSameSpecification(ProductVariant pv1, ProductVariant pv2) {
        if (pv1 == null || pv2 == null) {
            return false;
        }
        if (!pv1.getProduct().getId().equals(pv2.getProduct().getId())) {
            return false;
        }
        boolean ramEquals = (pv1.getRamGb() == null && pv2.getRamGb() == null)
                || (pv1.getRamGb() != null && pv1.getRamGb().equals(pv2.getRamGb()));
        boolean storageEquals = (pv1.getStorageGb() == null && pv2.getStorageGb() == null)
                || (pv1.getStorageGb() != null && pv1.getStorageGb().equals(pv2.getStorageGb()));
        boolean colorEquals = (pv1.getColor() == null && pv2.getColor() == null)
                || (pv1.getColor() != null && pv1.getColor().equalsIgnoreCase(pv2.getColor()));
        return ramEquals && storageEquals && colorEquals;
    }
}
