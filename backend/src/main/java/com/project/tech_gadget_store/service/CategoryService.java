package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.CategoryRequestDto;
import com.project.tech_gadget_store.dto.response.CategoryResponseDto;
import com.project.tech_gadget_store.entity.Category;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceInUseException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.CategoryRepository;
import com.project.tech_gadget_store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Category name already exists. Please use a different name");
        }
        Category category = new Category(dto.getName(), dto.getImageUrl());
        return toResponseDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponseDto updateCategory(String id, CategoryRequestDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("Category name already exists. Please use a different name");
        }
        category.setName(dto.getName());
        category.setImageUrl(dto.getImageUrl());
        return toResponseDto(categoryRepository.save(category));
    }

    @Transactional
    public void removeCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (productRepository.existsByCategoryId(id)) {
            throw new ResourceInUseException("Cannot remove a category that still has products. Please reassign or remove those products first");
        }
        categoryRepository.delete(category);
    }

    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toResponseDto)
                .toList();
    }

    private CategoryResponseDto toResponseDto(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .name(category.getName())
                .imageUrl(category.getImageUrl())
                .build();
    }
}
