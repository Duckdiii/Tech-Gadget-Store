package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ProductImageRequestDto;
import com.project.tech_gadget_store.dto.request.ProductRequestDto;
import com.project.tech_gadget_store.dto.request.ProductVariantRequestDto;
import com.project.tech_gadget_store.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.dto.response.ProductImageResponseDto;
import com.project.tech_gadget_store.dto.response.ProductVariantResponseDto;
import com.project.tech_gadget_store.entity.Brand;
import com.project.tech_gadget_store.entity.BundleService;
import com.project.tech_gadget_store.entity.Category;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.ProductImage;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ProductVariantEditRestrictedException;
import com.project.tech_gadget_store.exception.ProductVariantInUseException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.ProductMapper;
import com.project.tech_gadget_store.repository.BrandRepository;
import com.project.tech_gadget_store.repository.BundleServiceRepository;
import com.project.tech_gadget_store.repository.CategoryRepository;
import com.project.tech_gadget_store.repository.ProductImageRepository;
import com.project.tech_gadget_store.repository.ProductRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductManagementService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final BundleServiceRepository bundleServiceRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductDetailResponseDto createProduct(ProductRequestDto dto) {
        if (productRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Product name already exists. Please use a different name");
        }
        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + dto.getBrandId()));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Product product = new Product(dto.getName(), dto.getDescription(), brand, category);
        applySpecFields(product, dto);

        Product saved = productRepository.save(product);
        return toDetailResponseDto(saved);
    }

    @Transactional
    public ProductDetailResponseDto updateProduct(String id, ProductRequestDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (productRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("Product name already exists. Please use a different name");
        }

        if (!Objects.equals(product.getBrand().getId(), dto.getBrandId())) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + dto.getBrandId()));
            brand.addProduct(product);
        }
        if (!Objects.equals(product.getCategory().getId(), dto.getCategoryId())) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));
            category.addProduct(product);
        }

        product.changeBasicInfo(dto.getName(), dto.getDescription());
        applySpecFields(product, dto);

        Product saved = productRepository.save(product);
        return toDetailResponseDto(saved);
    }

    @Transactional
    public void discontinueProduct(String id) {
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found or already discontinued"));
        product.discontinue();
        productRepository.save(product);
    }

    @Transactional
    public ProductVariantResponseDto addVariant(String productId, ProductVariantRequestDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (productVariantRepository.existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCase(
                productId, dto.getRamGb(), dto.getStorageGb(), dto.getColor())) {
            throw new DuplicateResourceException("A variant with the same RAM, storage and color already exists");
        }

        ProductVariant variant = new ProductVariant(product, dto.getRamGb(), dto.getStorageGb(), dto.getColor(), dto.getPrice());
        ProductVariant saved = productVariantRepository.save(variant);
        return productMapper.toVariantResponseDto(saved);
    }

    @Transactional
    public ProductVariantResponseDto updateVariant(String productId, String variantId, ProductVariantRequestDto dto) {
        ProductVariant variant = productVariantRepository.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        boolean referenced = isVariantReferenced(variantId);
        boolean identityChanged = !Objects.equals(variant.getRamGb(), dto.getRamGb())
                || !Objects.equals(variant.getStorageGb(), dto.getStorageGb())
                || !Objects.equals(variant.getColor(), dto.getColor());

        if (referenced && identityChanged) {
            throw new ProductVariantEditRestrictedException(
                    "Cannot change RAM, storage or color for a variant that has order or warehouse history. Only price can be updated");
        }

        if (!referenced) {
            if (productVariantRepository.existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCaseAndIdNot(
                    productId, dto.getRamGb(), dto.getStorageGb(), dto.getColor(), variantId)) {
                throw new DuplicateResourceException("A variant with the same RAM, storage and color already exists");
            }
            variant.setRamGb(dto.getRamGb());
            variant.setStorageGb(dto.getStorageGb());
            variant.setColor(dto.getColor());
        }
        variant.changePrice(dto.getPrice());

        ProductVariant saved = productVariantRepository.save(variant);
        return productMapper.toVariantResponseDto(saved);
    }

    @Transactional
    public void removeVariant(String productId, String variantId) {
        ProductVariant variant = productVariantRepository.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        if (isVariantReferenced(variantId)) {
            throw new ProductVariantInUseException(
                    "Cannot remove a variant that has order, export, import or supply-order history");
        }
        productVariantRepository.delete(variant);
    }

    @Transactional
    public ProductImageResponseDto addImage(String productId, ProductImageRequestDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        ProductImage image = new ProductImage(product, dto.getName(), dto.getImageUrl());
        productRepository.save(product);
        return productMapper.toImageResponseDto(image, productId);
    }

    @Transactional
    public void removeImage(String productId, String imageId) {
        ProductImage image = productImageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));
        productImageRepository.delete(image);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void applySpecFields(Product product, ProductRequestDto dto) {
        product.setScreenSize(dto.getScreenSize());
        product.setRearCamera(dto.getRearCamera());
        product.setFrontCamera(dto.getFrontCamera());
        product.setChipset(dto.getChipset());
        product.setNfcSupported(dto.getNfcSupported());
        product.setBatteryCapacity(dto.getBatteryCapacity());
        product.setSimType(dto.getSimType());
        product.setOperatingSystem(dto.getOperatingSystem());
        product.setScreenResolution(dto.getScreenResolution());
    }

    private boolean isVariantReferenced(String variantId) {
        return productVariantRepository.existsInOrderItems(variantId)
                || productVariantRepository.existsInExportLogItems(variantId)
                || productVariantRepository.existsInImportLogItems(variantId)
                || productVariantRepository.existsInSupplyOrderItems(variantId);
    }

    private ProductDetailResponseDto toDetailResponseDto(Product product) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        List<BundleService> activeBundleServices = bundleServiceRepository.findByActiveTrue();
        return productMapper.toProductDetailResponseDto(product, variants, activeBundleServices);
    }
}
