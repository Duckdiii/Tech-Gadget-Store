package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private RecommendationService recommendationService;

    private Category category;
    private Brand brandApple;
    private Brand brandSamsung;
    private Product targetProduct;
    private ProductVariant targetVariant;

    @BeforeEach
    void setUp() {
        category = new Category("Phone", "http://image.url");
        category.setId("cat-id");

        brandApple = new Brand("Apple", "http://logo.url", "Apple Description");
        brandApple.setId("brand-apple-id");

        brandSamsung = new Brand("Samsung", "http://logo.url", "Samsung Description");
        brandSamsung.setId("brand-samsung-id");

        targetProduct = new Product("iPhone 15", "iPhone Description", brandApple, category);
        targetProduct.setId("target-id");
        targetProduct.setIsActive(true);

        targetVariant = new ProductVariant(targetProduct, 8, 128, "Black", BigDecimal.valueOf(1000.0));
        targetVariant.setId("v-target-id");
    }

    @Test
    void getSimilarProducts_ProductNotFound_ThrowsResourceNotFoundException() {
        when(productRepository.findByIdAndIsActiveTrue("target-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recommendationService.getSimilarProducts("target-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void getSimilarProducts_ProductHasNoVariants_ReturnsEmptyList() {
        when(productRepository.findByIdAndIsActiveTrue("target-id")).thenReturn(Optional.of(targetProduct));
        when(productVariantRepository.findByProductId("target-id")).thenReturn(Collections.emptyList());

        List<ProductResponseDto> result = recommendationService.getSimilarProducts("target-id");

        assertThat(result).isEmpty();
    }

    @Test
    void getSimilarProducts_Success_CalculateSimilarityScoresAndRank() {
        when(productRepository.findByIdAndIsActiveTrue("target-id")).thenReturn(Optional.of(targetProduct));
        when(productVariantRepository.findByProductId("target-id")).thenReturn(List.of(targetVariant));

        // Candidates: B (Samsung, Phone, price 1100, RAM 12, Storage 256) -> Score = 65
        Product productB = new Product("Galaxy S24", "Samsung phone", brandSamsung, category);
        productB.setId("B");
        productB.setIsActive(true);

        ProductVariant variantB = new ProductVariant(productB, 12, 256, "Black", BigDecimal.valueOf(1100.0));
        variantB.setId("v-b");

        // Candidates: C (Apple, Phone, price 900, RAM 6, Storage 64) -> Score = 75
        Product productC = new Product("iPhone 14", "Apple phone", brandApple, category);
        productC.setId("C");
        productC.setIsActive(true);

        ProductVariant variantC = new ProductVariant(productC, 6, 64, "Black", BigDecimal.valueOf(900.0));
        variantC.setId("v-c");

        // Candidates: D (Samsung, Phone, price 1500) -> Over 40% diff -> Excluded
        Product productD = new Product("Galaxy Fold", "Samsung foldable", brandSamsung, category);
        productD.setId("D");
        productD.setIsActive(true);

        ProductVariant variantD = new ProductVariant(productD, 16, 512, "Black", BigDecimal.valueOf(1500.0));
        variantD.setId("v-d");

        // Candidates: E (Apple, Phone, price 1000, RAM 8, Storage 128) -> Score = 100
        Product productE = new Product("iPhone 15 Plus", "Apple phone", brandApple, category);
        productE.setId("E");
        productE.setIsActive(true);

        ProductVariant variantE = new ProductVariant(productE, 8, 128, "Black", BigDecimal.valueOf(1000.0));
        variantE.setId("v-e");

        List<Product> candidates = List.of(productB, productC, productD, productE);
        when(productRepository.findCandidatesForRecommendation("cat-id", "target-id")).thenReturn(candidates);

        List<ProductVariant> allVariants = List.of(variantB, variantC, variantD, variantE);
        when(productVariantRepository.findVariantsForProductIds(List.of("B", "C", "D", "E"))).thenReturn(allVariants);

        // Stub mapper
        ProductResponseDto dtoB = ProductResponseDto.builder().id("B").name("Galaxy S24").build();
        ProductResponseDto dtoC = ProductResponseDto.builder().id("C").name("iPhone 14").build();
        ProductResponseDto dtoE = ProductResponseDto.builder().id("E").name("iPhone 15 Plus").build();

        when(productMapper.toProductResponseDto(eq(productB), anyList())).thenReturn(dtoB);
        when(productMapper.toProductResponseDto(eq(productC), anyList())).thenReturn(dtoC);
        when(productMapper.toProductResponseDto(eq(productE), anyList())).thenReturn(dtoE);

        List<ProductResponseDto> result = recommendationService.getSimilarProducts("target-id");

        // Assert size is 3 (D excluded due to price difference > 40%)
        assertThat(result).hasSize(3);

        // Assert correct ranking order based on scores (E = 100, C = 75, B = 65)
        assertThat(result.get(0).getId()).isEqualTo("E");
        assertThat(result.get(1).getId()).isEqualTo("C");
        assertThat(result.get(2).getId()).isEqualTo("B");
    }

    @Test
    void getFrequentlyBoughtTogether_Success_FullFlow_WithoutFallback() {
        List<Product> products = new ArrayList<>();
        List<ProductVariant> variants = new ArrayList<>();
        List<String> productIds = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            Product p = new Product("P" + i, "Desc", brandApple, category);
            p.setId("P" + i);
            products.add(p);
            ProductVariant v = new ProductVariant(p, 8, 128, "Black", BigDecimal.valueOf(1000.0));
            v.setId("v" + i);
            variants.add(v);
            productIds.add("P" + i);
        }

        when(productRepository.findFrequentlyBoughtTogetherIds("target-id", 6)).thenReturn(productIds);
        when(productRepository.findAllById(productIds)).thenReturn(products);
        when(productVariantRepository.findVariantsForProductIds(productIds)).thenReturn(variants);

        for (int i = 0; i < 6; i++) {
            ProductResponseDto dto = ProductResponseDto.builder().id("P" + (i + 1)).build();
            when(productMapper.toProductResponseDto(eq(products.get(i)), anyList())).thenReturn(dto);
        }

        List<ProductResponseDto> result = recommendationService.getFrequentlyBoughtTogether("target-id");

        assertThat(result).hasSize(6);
        assertThat(result.get(0).getId()).isEqualTo("P1");
        assertThat(result.get(5).getId()).isEqualTo("P6");
    }

    @Test
    void getFrequentlyBoughtTogether_Success_WithHybridFallback() {
        Product p1 = new Product("P1", "Desc", brandApple, category);
        p1.setId("P1");
        ProductVariant v1 = new ProductVariant(p1, 8, 128, "Black", BigDecimal.valueOf(1000.0));
        v1.setId("v1");

        // Co-occurrence returns P1
        when(productRepository.findFrequentlyBoughtTogetherIds("target-id", 6)).thenReturn(List.of("P1"));
        when(productRepository.findAllById(List.of("P1"))).thenReturn(List.of(p1));
        when(productVariantRepository.findVariantsForProductIds(List.of("P1"))).thenReturn(List.of(v1));

        ProductResponseDto dto1 = ProductResponseDto.builder().id("P1").build();
        when(productMapper.toProductResponseDto(eq(p1), anyList())).thenReturn(dto1);

        // Fallback Content-Based setup
        when(productRepository.findByIdAndIsActiveTrue("target-id")).thenReturn(Optional.of(targetProduct));
        when(productVariantRepository.findByProductId("target-id")).thenReturn(List.of(targetVariant));

        Product productC = new Product("iPhone 14", "Apple phone", brandApple, category);
        productC.setId("C");
        ProductVariant variantC = new ProductVariant(productC, 6, 64, "Black", BigDecimal.valueOf(900.0));
        variantC.setId("v-c");

        // Similar products candidate
        when(productRepository.findCandidatesForRecommendation("cat-id", "target-id")).thenReturn(List.of(productC, p1));
        when(productVariantRepository.findVariantsForProductIds(List.of("C", "P1"))).thenReturn(List.of(variantC, v1));

        ProductResponseDto dtoC = ProductResponseDto.builder().id("C").build();
        when(productMapper.toProductResponseDto(eq(productC), anyList())).thenReturn(dtoC);

        List<ProductResponseDto> result = recommendationService.getFrequentlyBoughtTogether("target-id");

        // Assert size is 2 (P1 from co-occurrence, C from content-based fallback, P1 fallback duplicate filtered out)
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo("P1");
        assertThat(result.get(1).getId()).isEqualTo("C");
    }

    @Test
    void getCartRecommendations_EmptyCart_ReturnsEmptyList() {
        List<ProductResponseDto> result = recommendationService.getCartRecommendations(Collections.emptyList());
        assertThat(result).isEmpty();
    }

    @Test
    void getCartRecommendations_Success_WithCartExclusionAndFallback() {
        List<String> cartProductIds = List.of("target-id", "P2");

        // Co-occurrence query for multiple returns empty (no purchase history)
        when(productRepository.findFrequentlyBoughtTogetherIdsForMultipleProducts(cartProductIds, 6)).thenReturn(Collections.emptyList());

        // Fallback Content-Based setup for first product "target-id"
        when(productRepository.findByIdAndIsActiveTrue("target-id")).thenReturn(Optional.of(targetProduct));
        when(productVariantRepository.findByProductId("target-id")).thenReturn(List.of(targetVariant));

        Product productC = new Product("iPhone 14", "Apple phone", brandApple, category);
        productC.setId("C");
        ProductVariant variantC = new ProductVariant(productC, 6, 64, "Black", BigDecimal.valueOf(900.0));
        variantC.setId("v-c");

        // Product already in cart (P2)
        Product productP2 = new Product("P2", "Apple phone", brandApple, category);
        productP2.setId("P2");
        ProductVariant variantP2 = new ProductVariant(productP2, 8, 128, "Black", BigDecimal.valueOf(1000.0));
        variantP2.setId("v-p2");

        when(productRepository.findCandidatesForRecommendation("cat-id", "target-id")).thenReturn(List.of(productC, productP2));
        when(productVariantRepository.findVariantsForProductIds(List.of("C", "P2"))).thenReturn(List.of(variantC, variantP2));

        ProductResponseDto dtoC = ProductResponseDto.builder().id("C").build();
        ProductResponseDto dtoP2 = ProductResponseDto.builder().id("P2").build();
        when(productMapper.toProductResponseDto(eq(productC), anyList())).thenReturn(dtoC);
        when(productMapper.toProductResponseDto(eq(productP2), anyList())).thenReturn(dtoP2);

        List<ProductResponseDto> result = recommendationService.getCartRecommendations(cartProductIds);

        // Assert size is 1 (P2 is excluded because it's in the cart, C is included)
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("C");
    }
}
