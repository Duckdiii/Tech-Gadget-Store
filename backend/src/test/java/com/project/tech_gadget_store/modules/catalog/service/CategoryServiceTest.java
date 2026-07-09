package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceInUseException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.request.CategoryRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.CategoryResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.repository.CategoryRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;




@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryService categoryService;

    private CategoryRequestDto validDto() {
        CategoryRequestDto dto = new CategoryRequestDto();
        dto.setName("Phones");
        dto.setImageUrl("http://img.png");
        return dto;
    }

    @Test
    void createCategory_success() {
        CategoryRequestDto dto = validDto();
        when(categoryRepository.existsByNameIgnoreCase("Phones")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoryResponseDto result = categoryService.createCategory(dto);

        assertThat(result.getName()).isEqualTo("Phones");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategory_duplicateName_throwsDuplicateResourceException() {
        CategoryRequestDto dto = validDto();
        when(categoryRepository.existsByNameIgnoreCase("Phones")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(dto))
                .isInstanceOf(DuplicateResourceException.class);

        verify(categoryRepository, never()).save(any());
    }

    @Test
    void updateCategory_success() {
        Category existing = new Category("Phones", "http://img.png");
        existing.setId("cat-1");
        CategoryRequestDto dto = validDto();
        dto.setName("Smartphones");

        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(existing));
        when(categoryRepository.existsByNameIgnoreCaseAndIdNot("Smartphones", "cat-1")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoryResponseDto result = categoryService.updateCategory("cat-1", dto);

        assertThat(result.getName()).isEqualTo("Smartphones");
    }

    @Test
    void updateCategory_notFound_throwsResourceNotFoundException() {
        when(categoryRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.updateCategory("missing", validDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeCategory_notInUse_deletesCategory() {
        Category existing = new Category("Phones", "http://img.png");
        existing.setId("cat-1");
        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(existing));
        when(productRepository.existsByCategoryId("cat-1")).thenReturn(false);

        categoryService.removeCategory("cat-1");

        verify(categoryRepository).delete(existing);
    }

    @Test
    void removeCategory_inUse_throwsResourceInUseException() {
        Category existing = new Category("Phones", "http://img.png");
        existing.setId("cat-1");
        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(existing));
        when(productRepository.existsByCategoryId("cat-1")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.removeCategory("cat-1"))
                .isInstanceOf(ResourceInUseException.class);

        verify(categoryRepository, never()).delete(any());
    }
}
