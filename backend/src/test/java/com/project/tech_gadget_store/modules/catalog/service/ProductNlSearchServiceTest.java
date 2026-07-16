package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.config.ChatbotProperties;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.NlSearchResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import com.project.tech_gadget_store.modules.catalog.repository.CategoryRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Chỉ kiểm tra các nhánh không gọi Gemini thật (query rỗng, chưa cấu hình API key) — nhánh
 * gọi model cần refactor để inject {@code Client} mới unit-test được mà không đụng mạng thật.
 */
@ExtendWith(MockitoExtension.class)
class ProductNlSearchServiceTest {

    @Mock
    private ProductService productService;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ChatbotProperties chatbotProperties;

    @InjectMocks
    private ProductNlSearchService productNlSearchService;

    private ProductPageResponseDto emptyPage() {
        return ProductPageResponseDto.builder().items(List.of()).page(0).size(20).totalItems(0).totalPages(0).build();
    }

    @Test
    void search_nullQuery_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> productNlSearchService.search(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void search_blankQuery_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> productNlSearchService.search("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void search_apiKeyNotConfigured_fallsBackToPlainKeywordFilter() {
        when(chatbotProperties.getApiKey()).thenReturn("");
        when(productService.findProductsByFilter(any(ProductFilterRequestDto.class))).thenReturn(emptyPage());

        NlSearchResponseDto result = productNlSearchService.search("laptop gaming rẻ");

        assertThat(result.getInterpretedFilter().getKeyword()).isEqualTo("laptop gaming rẻ");
        verify(brandRepository, never()).findAll();
        verify(categoryRepository, never()).findAll();
    }

    @Test
    void search_apiKeyNull_fallsBackToPlainKeywordFilter() {
        when(chatbotProperties.getApiKey()).thenReturn(null);
        when(productService.findProductsByFilter(any(ProductFilterRequestDto.class))).thenReturn(emptyPage());

        NlSearchResponseDto result = productNlSearchService.search("tai nghe chống ồn");

        assertThat(result.getInterpretedFilter().getKeyword()).isEqualTo("tai nghe chống ồn");
    }

    @Test
    void search_queryLongerThan200Chars_isTruncatedBeforeSearching() {
        when(chatbotProperties.getApiKey()).thenReturn("");
        when(productService.findProductsByFilter(any(ProductFilterRequestDto.class))).thenReturn(emptyPage());
        String longQuery = "a".repeat(250);

        NlSearchResponseDto result = productNlSearchService.search(longQuery);

        assertThat(result.getInterpretedFilter().getKeyword()).hasSize(200);
    }

    @Test
    void search_returnsResultsFromProductService() {
        when(chatbotProperties.getApiKey()).thenReturn("");
        ProductPageResponseDto page = emptyPage();
        when(productService.findProductsByFilter(any(ProductFilterRequestDto.class))).thenReturn(page);

        NlSearchResponseDto result = productNlSearchService.search("chuột không dây");

        assertThat(result.getResults()).isSameAs(page);
    }
}
