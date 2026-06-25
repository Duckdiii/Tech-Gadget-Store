package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ImportLogItemRequestDto;
import com.project.tech_gadget_store.dto.request.ImportLogRequestDto;
import com.project.tech_gadget_store.dto.request.NewProductImportDto;
import com.project.tech_gadget_store.dto.response.ImportLogResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.ImportLogMapper;
import com.project.tech_gadget_store.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class ImportLogService {

    private final ImportLogRepository importLogRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ImportLogMapper importLogMapper;

    public ImportLogService(ImportLogRepository importLogRepository,
                            ProductVariantRepository productVariantRepository,
                            UserRepository userRepository,
                            BrandRepository brandRepository,
                            CategoryRepository categoryRepository,
                            ProductRepository productRepository,
                            ImportLogMapper importLogMapper) {
        this.importLogRepository = importLogRepository;
        this.productVariantRepository = productVariantRepository;
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.importLogMapper = importLogMapper;
    }

    @Transactional
    public ImportLogResponseDto importProducts(ImportLogRequestDto requestDto) {
        // 1. Validate performedById exists
        if (!userRepository.existsById(requestDto.getPerformedById())) {
            throw new ResourceNotFoundException("Performer not found");
        }

        // Create import log
        ImportLog importLog = new ImportLog(requestDto.getPerformedById(), ImportAndExportStatus.SUCCESS);
        importLog.setNote(requestDto.getNote());

        for (ImportLogItemRequestDto itemDto : requestDto.getItems()) {
            int qty = itemDto.getQuantity();

            if (itemDto.getProductVariantId() != null && !itemDto.getProductVariantId().isBlank()) {
                // Alternative Flow 5a: existing product variant
                // Retrieve the existing variant to copy specifications
                ProductVariant referenceVariant = productVariantRepository.findById(itemDto.getProductVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

                for (int i = 0; i < qty; i++) {
                    ProductVariant newVariant = new ProductVariant(
                            referenceVariant.getProduct(),
                            referenceVariant.getRamGb(),
                            referenceVariant.getStorageGb(),
                            referenceVariant.getColor(),
                            referenceVariant.getPrice()
                    );
                    productVariantRepository.save(newVariant);

                    // Create ImportLogItem pointing to the new physical unit (quantity is 1 per physical unit)
                    new ImportLogItem(importLog, newVariant, 1, itemDto.getImportPrice());
                }
            } else if (itemDto.getNewProduct() != null) {
                // Alternative Flow 5b: new product
                NewProductImportDto newProductDto = itemDto.getNewProduct();
                
                // Check duplicate product name
                if (productRepository.existsByNameIgnoreCase(newProductDto.getName())) {
                    throw new DuplicateResourceException("Product information already exists");
                }

                Brand brand = brandRepository.findById(newProductDto.getBrandId())
                        .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

                Category category = categoryRepository.findById(newProductDto.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

                // Create and save product
                Product product = new Product(newProductDto.getName(), newProductDto.getDescription(), brand, category);
                productRepository.save(product);

                for (int i = 0; i < qty; i++) {
                    ProductVariant newVariant = new ProductVariant(
                            product,
                            newProductDto.getRamGb(),
                            newProductDto.getStorageGb(),
                            newProductDto.getColor(),
                            newProductDto.getPrice()
                    );
                    productVariantRepository.save(newVariant);

                    // Create ImportLogItem pointing to the new physical unit (quantity is 1 per physical unit)
                    new ImportLogItem(importLog, newVariant, 1, itemDto.getImportPrice());
                }
            } else {
                throw new IllegalArgumentException("Either productVariantId or newProduct must be provided");
            }
        }

        ImportLog savedLog = importLogRepository.save(importLog);
        return importLogMapper.toImportLogResponseDto(savedLog);
    }

    public List<ImportLogResponseDto> getAllImportLogs() {
        return importLogRepository.findAll().stream()
                .map(importLogMapper::toImportLogResponseDto)
                .collect(Collectors.toList());
    }
}
