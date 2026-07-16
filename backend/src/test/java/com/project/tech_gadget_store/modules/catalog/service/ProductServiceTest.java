package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;



@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BundleServiceRepository bundleServiceRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @InjectMocks
    private ProductService productService;

    private Product product(String name) {
        Brand brand = new Brand("Apple", "http://logo.png", "Apple Inc.");
        Category category = new Category("Điện thoại", "http://img.png");
        Product product = new Product(name, "Mô tả sản phẩm", brand, category);
        product.setId("prod-1");
        return product;
    }

    @Test
    void findAll_capsSizeAtMaxPageSize_whenRequestedSizeExceedsLimit() {
        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        productService.findAll(0, 500);

        var pageableCaptor = org.mockito.ArgumentCaptor.forClass(Pageable.class);
        verify(productRepository).findAll(any(Specification.class), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(100);
    }

    @Test
    void viewDetailProduct_found_returnsMappedDetail() {
        Product product = product("iPhone 15");
        List<ProductVariant> variants = List.of(new ProductVariant(product, 8, 256, "Đen", BigDecimal.valueOf(20_000_000)));
        ProductDetailResponseDto expected = ProductDetailResponseDto.builder().id("prod-1").name("iPhone 15").build();

        when(productRepository.findByIdAndIsActiveTrue("prod-1")).thenReturn(Optional.of(product));
        when(productVariantRepository.findByProductId("prod-1")).thenReturn(variants);
        when(bundleServiceRepository.findByActiveTrue()).thenReturn(List.of());
        when(productMapper.toProductDetailResponseDto(product, variants, List.of())).thenReturn(expected);

        ProductDetailResponseDto result = productService.viewDetailProduct("prod-1");

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void viewDetailProduct_notFoundOrInactive_throwsResourceNotFoundException() {
        when(productRepository.findByIdAndIsActiveTrue("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.viewDetailProduct("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findProductsByFilter_blankKeyword_delegatesToSpecificationSearch() {
        Product product = product("iPhone 15");
        Page<Product> page = new PageImpl<>(List.of(product));
        ProductResponseDto mapped = ProductResponseDto.builder().id("prod-1").name("iPhone 15").build();

        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(productVariantRepository.findByProductId("prod-1")).thenReturn(List.of());
        when(productMapper.toProductResponseDto(eq(product), any())).thenReturn(mapped);

        ProductFilterRequestDto filter = ProductFilterRequestDto.builder().page(0).size(20).build();
        ProductPageResponseDto result = productService.findProductsByFilter(filter);

        assertThat(result.getItems()).containsExactly(mapped);
        assertThat(result.getTotalItems()).isEqualTo(1);
        verify(productRepository, never()).searchProductIdsByKeyword(anyString(), anyInt());
    }

    @Test
    void findProductsByFilter_keywordWithNoMatches_returnsEmptyPageWithoutQueryingSpecification() {
        when(productRepository.searchProductIdsByKeyword("xyz123", 2000)).thenReturn(List.of());

        ProductFilterRequestDto filter = ProductFilterRequestDto.builder().keyword("xyz123").page(0).size(20).build();
        ProductPageResponseDto result = productService.findProductsByFilter(filter);

        assertThat(result.getItems()).isEmpty();
        assertThat(result.getTotalItems()).isZero();
        verify(productRepository, never()).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void findProductsByFilter_keywordWithExplicitSort_ranksThroughRepositoryPaging() {
        Product product = product("iPhone 15");
        ProductResponseDto mapped = ProductResponseDto.builder().id("prod-1").name("iPhone 15").build();

        when(productRepository.searchProductIdsByKeyword("iphone", 2000)).thenReturn(List.of("prod-1"));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product)));
        when(productVariantRepository.findByProductId("prod-1")).thenReturn(List.of());
        when(productMapper.toProductResponseDto(eq(product), any())).thenReturn(mapped);

        ProductFilterRequestDto filter = ProductFilterRequestDto.builder()
                .keyword("iphone").sort("price_asc").page(0).size(20).build();
        ProductPageResponseDto result = productService.findProductsByFilter(filter);

        assertThat(result.getItems()).containsExactly(mapped);
    }

    @Test
    void findTodayFlashSaleProducts_activePromotion_returnsMappedResult() {
        Product product = product("iPhone 15");
        LocalDateTime now = LocalDateTime.now();
        Promotion promotion = new Promotion("SALE10", "Giảm 10%", 10.0, now.minusHours(1), now.plusHours(1), true, product);
        ProductVariant variant = new ProductVariant(product, 8, 256, "Đen", BigDecimal.valueOf(20_000_000));
        FlashSaleProductResponseDto expected = FlashSaleProductResponseDto.builder().id("prod-1").build();

        when(productRepository.findTodayFlashSaleProducts(any(LocalDateTime.class))).thenReturn(List.of(product));
        when(productVariantRepository.findByProductId("prod-1")).thenReturn(List.of(variant));
        when(productMapper.toFlashSaleProductResponseDto(eq(product), eq(promotion), eq(variant))).thenReturn(expected);

        List<FlashSaleProductResponseDto> result = productService.findTodayFlashSaleProducts();

        assertThat(result).containsExactly(expected);
    }
}
