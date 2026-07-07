package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ProductImageRequestDto;
import com.project.tech_gadget_store.dto.request.ProductRequestDto;
import com.project.tech_gadget_store.dto.request.ProductVariantRequestDto;
import com.project.tech_gadget_store.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.dto.response.ProductVariantResponseDto;
import com.project.tech_gadget_store.entity.Brand;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductManagementServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BundleServiceRepository bundleServiceRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductManagementService productManagementService;

    private Brand brand() {
        Brand brand = new Brand("Apple", "http://logo.png", "Phone maker");
        brand.setId("brand-1");
        return brand;
    }

    private Category category() {
        Category category = new Category("Phones", "http://img.png");
        category.setId("cat-1");
        return category;
    }

    private Product product() {
        Product product = new Product("iPhone 15", "desc", brand(), category());
        product.setId("prod-1");
        return product;
    }

    private ProductRequestDto validCreateDto() {
        ProductRequestDto dto = new ProductRequestDto();
        dto.setName("iPhone 15");
        dto.setDescription("desc");
        dto.setBrandId("brand-1");
        dto.setCategoryId("cat-1");
        return dto;
    }

    private ProductVariantRequestDto validVariantDto() {
        ProductVariantRequestDto dto = new ProductVariantRequestDto();
        dto.setRamGb(8);
        dto.setStorageGb(128);
        dto.setColor("Black");
        dto.setPrice(new BigDecimal("20000000"));
        return dto;
    }

    // ---------------------------------------------------------------
    // createProduct
    // ---------------------------------------------------------------

    @Test
    void createProduct_success() {
        ProductRequestDto dto = validCreateDto();
        when(productRepository.existsByNameIgnoreCase(dto.getName())).thenReturn(false);
        when(brandRepository.findById("brand-1")).thenReturn(Optional.of(brand()));
        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(category()));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId("prod-1");
            return p;
        });
        when(productVariantRepository.findByProductId("prod-1")).thenReturn(List.of());
        when(bundleServiceRepository.findByActiveTrue()).thenReturn(List.of());
        when(productMapper.toProductDetailResponseDto(any(), any(), any()))
                .thenReturn(ProductDetailResponseDto.builder().name("iPhone 15").build());

        ProductDetailResponseDto result = productManagementService.createProduct(dto);

        assertThat(result.getName()).isEqualTo("iPhone 15");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_duplicateName_throwsDuplicateResourceException() {
        ProductRequestDto dto = validCreateDto();
        when(productRepository.existsByNameIgnoreCase(dto.getName())).thenReturn(true);

        assertThatThrownBy(() -> productManagementService.createProduct(dto))
                .isInstanceOf(DuplicateResourceException.class);

        verify(productRepository, never()).save(any());
    }

    @Test
    void createProduct_brandNotFound_throwsResourceNotFoundException() {
        ProductRequestDto dto = validCreateDto();
        when(productRepository.existsByNameIgnoreCase(dto.getName())).thenReturn(false);
        when(brandRepository.findById("brand-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productManagementService.createProduct(dto))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(productRepository, never()).save(any());
    }

    // ---------------------------------------------------------------
    // updateProduct
    // ---------------------------------------------------------------

    @Test
    void updateProduct_success() {
        Product existing = product();
        ProductRequestDto dto = validCreateDto();
        dto.setName("iPhone 15 Pro");

        when(productRepository.findById("prod-1")).thenReturn(Optional.of(existing));
        when(productRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), "prod-1")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productVariantRepository.findByProductId(anyString())).thenReturn(List.of());
        when(bundleServiceRepository.findByActiveTrue()).thenReturn(List.of());
        when(productMapper.toProductDetailResponseDto(any(), any(), any()))
                .thenReturn(ProductDetailResponseDto.builder().name("iPhone 15 Pro").build());

        ProductDetailResponseDto result = productManagementService.updateProduct("prod-1", dto);

        assertThat(result.getName()).isEqualTo("iPhone 15 Pro");
        assertThat(existing.getName()).isEqualTo("iPhone 15 Pro");
    }

    @Test
    void updateProduct_notFound_throwsResourceNotFoundException() {
        when(productRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productManagementService.updateProduct("missing", validCreateDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ---------------------------------------------------------------
    // discontinueProduct
    // ---------------------------------------------------------------

    @Test
    void discontinueProduct_success() {
        Product existing = product();
        when(productRepository.findByIdAndIsActiveTrue("prod-1")).thenReturn(Optional.of(existing));

        productManagementService.discontinueProduct("prod-1");

        assertThat(existing.getIsActive()).isFalse();
        verify(productRepository).save(existing);
    }

    @Test
    void discontinueProduct_notFound_throwsResourceNotFoundException() {
        when(productRepository.findByIdAndIsActiveTrue("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productManagementService.discontinueProduct("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ---------------------------------------------------------------
    // variants
    // ---------------------------------------------------------------

    @Test
    void addVariant_success() {
        Product product = product();
        ProductVariantRequestDto dto = validVariantDto();
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(productVariantRepository.existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCase(
                "prod-1", 8, 128, "Black")).thenReturn(false);
        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productMapper.toVariantResponseDto(any(ProductVariant.class)))
                .thenReturn(ProductVariantResponseDto.builder().ramGb(8).storageGb(128).color("Black").build());

        ProductVariantResponseDto result = productManagementService.addVariant("prod-1", dto);

        assertThat(result.getColor()).isEqualTo("Black");
        verify(productVariantRepository).save(any(ProductVariant.class));
    }

    @Test
    void addVariant_duplicate_throwsDuplicateResourceException() {
        Product product = product();
        ProductVariantRequestDto dto = validVariantDto();
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(productVariantRepository.existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCase(
                "prod-1", 8, 128, "Black")).thenReturn(true);

        assertThatThrownBy(() -> productManagementService.addVariant("prod-1", dto))
                .isInstanceOf(DuplicateResourceException.class);

        verify(productVariantRepository, never()).save(any());
    }

    @Test
    void updateVariant_notReferenced_allowsFullEdit() {
        Product product = product();
        ProductVariant variant = new ProductVariant(product, 8, 128, "Black", new BigDecimal("20000000"));
        variant.setId("var-1");

        ProductVariantRequestDto dto = validVariantDto();
        dto.setColor("Blue");
        dto.setPrice(new BigDecimal("21000000"));

        when(productVariantRepository.findByIdAndProductId("var-1", "prod-1")).thenReturn(Optional.of(variant));
        when(productVariantRepository.existsInOrderItems("var-1")).thenReturn(false);
        when(productVariantRepository.existsInExportLogItems("var-1")).thenReturn(false);
        when(productVariantRepository.existsInImportLogItems("var-1")).thenReturn(false);
        when(productVariantRepository.existsInSupplyOrderItems("var-1")).thenReturn(false);
        when(productVariantRepository.existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCaseAndIdNot(
                "prod-1", 8, 128, "Blue", "var-1")).thenReturn(false);
        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productMapper.toVariantResponseDto(any(ProductVariant.class)))
                .thenReturn(ProductVariantResponseDto.builder().color("Blue").build());

        ProductVariantResponseDto result = productManagementService.updateVariant("prod-1", "var-1", dto);

        assertThat(result.getColor()).isEqualTo("Blue");
        assertThat(variant.getColor()).isEqualTo("Blue");
    }

    @Test
    void updateVariant_referencedAndIdentityChanged_throwsEditRestricted() {
        Product product = product();
        ProductVariant variant = new ProductVariant(product, 8, 128, "Black", new BigDecimal("20000000"));
        variant.setId("var-1");

        ProductVariantRequestDto dto = validVariantDto();
        dto.setColor("Blue");

        when(productVariantRepository.findByIdAndProductId("var-1", "prod-1")).thenReturn(Optional.of(variant));
        when(productVariantRepository.existsInOrderItems("var-1")).thenReturn(true);

        assertThatThrownBy(() -> productManagementService.updateVariant("prod-1", "var-1", dto))
                .isInstanceOf(ProductVariantEditRestrictedException.class);

        verify(productVariantRepository, never()).save(any());
    }

    @Test
    void updateVariant_referencedButOnlyPriceChanged_allowsUpdate() {
        Product product = product();
        ProductVariant variant = new ProductVariant(product, 8, 128, "Black", new BigDecimal("20000000"));
        variant.setId("var-1");

        ProductVariantRequestDto dto = validVariantDto();
        dto.setPrice(new BigDecimal("22000000"));

        when(productVariantRepository.findByIdAndProductId("var-1", "prod-1")).thenReturn(Optional.of(variant));
        when(productVariantRepository.existsInOrderItems("var-1")).thenReturn(true);
        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productMapper.toVariantResponseDto(any(ProductVariant.class)))
                .thenReturn(ProductVariantResponseDto.builder().price(new BigDecimal("22000000")).build());

        ProductVariantResponseDto result = productManagementService.updateVariant("prod-1", "var-1", dto);

        assertThat(result.getPrice()).isEqualByComparingTo("22000000");
        assertThat(variant.getPrice()).isEqualByComparingTo("22000000");
    }

    @Test
    void removeVariant_referenced_throwsInUseException() {
        Product product = product();
        ProductVariant variant = new ProductVariant(product, 8, 128, "Black", new BigDecimal("20000000"));
        variant.setId("var-1");

        when(productVariantRepository.findByIdAndProductId("var-1", "prod-1")).thenReturn(Optional.of(variant));
        when(productVariantRepository.existsInOrderItems("var-1")).thenReturn(true);

        assertThatThrownBy(() -> productManagementService.removeVariant("prod-1", "var-1"))
                .isInstanceOf(ProductVariantInUseException.class);

        verify(productVariantRepository, never()).delete(any());
    }

    @Test
    void removeVariant_notReferenced_deletesVariant() {
        Product product = product();
        ProductVariant variant = new ProductVariant(product, 8, 128, "Black", new BigDecimal("20000000"));
        variant.setId("var-1");

        when(productVariantRepository.findByIdAndProductId("var-1", "prod-1")).thenReturn(Optional.of(variant));
        when(productVariantRepository.existsInOrderItems("var-1")).thenReturn(false);
        when(productVariantRepository.existsInExportLogItems("var-1")).thenReturn(false);
        when(productVariantRepository.existsInImportLogItems("var-1")).thenReturn(false);
        when(productVariantRepository.existsInSupplyOrderItems("var-1")).thenReturn(false);

        productManagementService.removeVariant("prod-1", "var-1");

        verify(productVariantRepository).delete(variant);
    }

    // ---------------------------------------------------------------
    // images
    // ---------------------------------------------------------------

    @Test
    void addImage_success() {
        Product product = product();
        ProductImageRequestDto dto = new ProductImageRequestDto();
        dto.setName("Front");
        dto.setImageUrl("http://img.png/1.png");

        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(productMapper.toImageResponseDto(any(ProductImage.class), eq("prod-1")))
                .thenReturn(com.project.tech_gadget_store.dto.response.ProductImageResponseDto.builder()
                        .imageUrl("http://img.png/1.png").build());

        var result = productManagementService.addImage("prod-1", dto);

        assertThat(result.getImageUrl()).isEqualTo("http://img.png/1.png");
        assertThat(product.getImages()).hasSize(1);
        verify(productRepository).save(product);
    }

    @Test
    void removeImage_success() {
        Product product = product();
        ProductImage image = new ProductImage(product, "Front", "http://img.png/1.png");
        image.setId("img-1");

        when(productImageRepository.findByIdAndProductId("img-1", "prod-1")).thenReturn(Optional.of(image));

        productManagementService.removeImage("prod-1", "img-1");

        verify(productImageRepository).delete(image);
    }

    @Test
    void removeImage_notFound_throwsResourceNotFoundException() {
        when(productImageRepository.findByIdAndProductId("img-1", "prod-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productManagementService.removeImage("prod-1", "img-1"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
