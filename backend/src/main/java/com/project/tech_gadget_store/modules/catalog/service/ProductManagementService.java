package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ProductVariantEditRestrictedException;
import com.project.tech_gadget_store.common.exception.ProductVariantInUseException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductImageRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductVariantRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductImageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductStatsResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductVariantResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Laptop;
import com.project.tech_gadget_store.modules.catalog.entity.Monitor;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductFactory;
import com.project.tech_gadget_store.modules.catalog.entity.ProductImage;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import com.project.tech_gadget_store.modules.catalog.repository.CategoryRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductImageRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



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
    private final OrderRepository orderRepository;
    private final ProductMapper productMapper;

    public ProductStatsResponseDto getProductStats() {
        return ProductStatsResponseDto.builder()
                .totalActive(productRepository.countAllActive())
                .outOfStock(productRepository.countActiveOutOfStock())
                .noVariants(productRepository.countActiveWithNoVariants())
                .noImages(productRepository.countActiveWithNoImages())
                .build();
    }

    @Transactional
    public ProductDetailResponseDto createProduct(ProductRequestDto dto) {
        if (productRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Product name already exists. Please use a different name");
        }
        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + dto.getBrandId()));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Product product = ProductFactory.createProduct(category, dto.getName(), dto.getDescription(), brand);
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
    public void reactivateProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.reactivate();
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
        if (product instanceof Phone phone) {
            phone.setScreenSize(dto.getScreenSize());
            phone.setRearCamera(dto.getRearCamera());
            phone.setFrontCamera(dto.getFrontCamera());
            phone.setChipset(dto.getChipset());
            phone.setNfcSupported(dto.getNfcSupported());
            phone.setBatteryCapacity(dto.getBatteryCapacity());
            phone.setSimType(dto.getSimType());
            phone.setOperatingSystem(dto.getOperatingSystem());
            phone.setScreenResolution(dto.getScreenResolution());
        } else if (product instanceof Laptop laptop) {
            laptop.setScreenSize(dto.getScreenSize());
            laptop.setOperatingSystem(dto.getOperatingSystem());
            // Other laptop-specific specs can be set here if present in DTO/future extensions
        } else if (product instanceof Monitor monitor) {
            monitor.setScreenSize(dto.getScreenSize());
            monitor.setResolution(dto.getScreenResolution());
        }
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
        Integer salesCount = orderRepository.countSalesByProductId(product.getId());
        return productMapper.toProductDetailResponseDto(product, variants, activeBundleServices, salesCount);
    }
}
