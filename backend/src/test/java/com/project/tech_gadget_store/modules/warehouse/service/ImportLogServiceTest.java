package com.project.tech_gadget_store.modules.warehouse.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.UserRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import com.project.tech_gadget_store.modules.catalog.repository.CategoryRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ImportLogItemRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ImportLogRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.NewProductImportDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.ImportLogItemResponseDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.ImportLogResponseDto;
import com.project.tech_gadget_store.modules.warehouse.entity.ImportLog;
import com.project.tech_gadget_store.modules.warehouse.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.modules.warehouse.mapper.ImportLogMapper;
import com.project.tech_gadget_store.modules.warehouse.repository.ImportLogRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;




@ExtendWith(MockitoExtension.class)
class ImportLogServiceTest {

    @Mock
    private ImportLogRepository importLogRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private ProductSerialRepository productSerialRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ImportLogMapper importLogMapper;
    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ImportLogService importLogService;

    private Brand brand;
    private Category category;
    private Product product;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        brand = mock(Brand.class);
        category = mock(Category.class);
        product = mock(Product.class);
        variant = mock(ProductVariant.class);
    }

    @Test
    void importProducts_PerformerNotFound_ThrowsResourceNotFoundException() {
        ImportLogRequestDto requestDto = ImportLogRequestDto.builder()
                .performedById("invalid-id")
                .items(List.of(ImportLogItemRequestDto.builder().build()))
                .build();

        when(userRepository.existsById("invalid-id")).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> importLogService.importProducts(requestDto));
        verify(importLogRepository, never()).save(any());
    }

    @Test
    void importProducts_ExistingVariant_Success() {
        ImportLogRequestDto requestDto = ImportLogRequestDto.builder()
                .performedById("performer-id")
                .items(List.of(
                        ImportLogItemRequestDto.builder()
                                .productVariantId("variant-id")
                                .quantity(2)
                                .importPrice(BigDecimal.valueOf(100.0))
                                .build()
                ))
                .note("Import note")
                .build();

        when(userRepository.existsById("performer-id")).thenReturn(true);
        when(productVariantRepository.findById("variant-id")).thenReturn(Optional.of(variant));
        
        when(variant.getProduct()).thenReturn(product);
        when(variant.getId()).thenReturn("variant-id");
        lenient().when(variant.getRamGb()).thenReturn(8);
        lenient().when(variant.getStorageGb()).thenReturn(128);
        lenient().when(variant.getColor()).thenReturn("Black");
        lenient().when(variant.getPrice()).thenReturn(BigDecimal.valueOf(150.0));

        // No saving of variant since it exists
        lenient().when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(invocation -> {
            ProductVariant pv = invocation.getArgument(0);
            pv.setId("physical-unit-id");
            return pv;
        });

        when(importLogRepository.save(any(ImportLog.class))).thenAnswer(invocation -> {
            ImportLog log = invocation.getArgument(0);
            log.setId("log-id");
            return log;
        });

        when(importLogMapper.toImportLogResponseDto(any(ImportLog.class))).thenAnswer(inv -> {
            ImportLog log = inv.getArgument(0);
            return ImportLogResponseDto.builder()
                    .performedById(log.getPerformedBy())
                    .note(log.getNote())
                    .status(log.getStatus())
                    .items(log.getItems().stream().map(item -> ImportLogItemResponseDto.builder()
                            .productVariantId(item.getProductVariant().getId())
                            .quantity(item.getQuantity())
                            .build()).toList())
                    .totalQuantity(log.calculateTotalQuantity())
                    .totalValue(log.calculateTotalImportValue())
                    .build();
        });

        ImportLogResponseDto response = importLogService.importProducts(requestDto);

        assertNotNull(response);
        assertEquals("performer-id", response.getPerformedById());
        assertEquals("Import note", response.getNote());
        assertEquals(ImportAndExportStatus.SUCCESS, response.getStatus());
        assertEquals(2, response.getItems().size());
        assertEquals("variant-id", response.getItems().get(0).getProductVariantId());
        assertEquals(1, response.getItems().get(0).getQuantity());
        assertEquals("variant-id", response.getItems().get(1).getProductVariantId());
        assertEquals(1, response.getItems().get(1).getQuantity());
        assertEquals(2, response.getTotalQuantity());
        assertEquals(BigDecimal.valueOf(200.0), response.getTotalValue());

        verify(productVariantRepository, never()).save(any(ProductVariant.class));
        verify(importLogRepository).save(any(ImportLog.class));
    }

    @Test
    void importProducts_NewProduct_DuplicateName_ThrowsDuplicateResourceException() {
        NewProductImportDto newProductDto = NewProductImportDto.builder()
                .name("Duplicate Phone")
                .brandId("brand-id")
                .categoryId("cat-id")
                .price(BigDecimal.valueOf(500.0))
                .build();

        ImportLogRequestDto requestDto = ImportLogRequestDto.builder()
                .performedById("performer-id")
                .items(List.of(
                        ImportLogItemRequestDto.builder()
                                .newProduct(newProductDto)
                                .quantity(5)
                                .importPrice(BigDecimal.valueOf(400.0))
                                .build()
                ))
                .build();

        when(userRepository.existsById("performer-id")).thenReturn(true);
        when(productRepository.existsByNameIgnoreCase("Duplicate Phone")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> importLogService.importProducts(requestDto));
        verify(importLogRepository, never()).save(any());
    }

    @Test
    void importProducts_NewProduct_Success() {
        NewProductImportDto newProductDto = NewProductImportDto.builder()
                .name("New Phone")
                .description("New Desc")
                .brandId("brand-id")
                .categoryId("cat-id")
                .ramGb(8)
                .storageGb(128)
                .color("Black")
                .price(BigDecimal.valueOf(500.0))
                .build();

        ImportLogRequestDto requestDto = ImportLogRequestDto.builder()
                .performedById("performer-id")
                .items(List.of(
                        ImportLogItemRequestDto.builder()
                                .newProduct(newProductDto)
                                .quantity(2)
                                .importPrice(BigDecimal.valueOf(400.0))
                                .build()
                ))
                .build();

        when(userRepository.existsById("performer-id")).thenReturn(true);
        when(productRepository.existsByNameIgnoreCase("New Phone")).thenReturn(false);
        when(brandRepository.findById("brand-id")).thenReturn(Optional.of(brand));
        when(categoryRepository.findById("cat-id")).thenReturn(Optional.of(category));

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId("new-product-id");
            return p;
        });

        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> {
            ProductVariant pv = inv.getArgument(0);
            pv.setId("new-physical-unit-id");
            return pv;
        });

        when(importLogRepository.save(any(ImportLog.class))).thenAnswer(inv -> {
            ImportLog log = inv.getArgument(0);
            log.setId("log-id");
            return log;
        });

        when(importLogMapper.toImportLogResponseDto(any(ImportLog.class))).thenAnswer(inv -> {
            ImportLog log = inv.getArgument(0);
            return ImportLogResponseDto.builder()
                    .performedById(log.getPerformedBy())
                    .note(log.getNote())
                    .status(log.getStatus())
                    .items(log.getItems().stream().map(item -> ImportLogItemResponseDto.builder()
                            .productVariantId(item.getProductVariant().getId())
                            .quantity(item.getQuantity())
                            .build()).toList())
                    .totalQuantity(log.calculateTotalQuantity())
                    .totalValue(log.calculateTotalImportValue())
                    .build();
        });

        ImportLogResponseDto response = importLogService.importProducts(requestDto);

        assertNotNull(response);
        assertEquals("performer-id", response.getPerformedById());
        assertEquals(2, response.getItems().size());
        assertEquals("new-physical-unit-id", response.getItems().get(0).getProductVariantId());
        assertEquals(1, response.getItems().get(0).getQuantity());
        assertEquals("new-physical-unit-id", response.getItems().get(1).getProductVariantId());
        assertEquals(2, response.getTotalQuantity());
        assertEquals(BigDecimal.valueOf(800.0), response.getTotalValue());
        
        verify(productRepository).save(any(Product.class));
        verify(productVariantRepository, times(1)).save(any(ProductVariant.class));
        verify(importLogRepository).save(any(ImportLog.class));
    }
}
