package com.project.tech_gadget_store.modules.warehouse.service;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.common.util.CursorUtil;
import com.project.tech_gadget_store.modules.auth.repository.UserRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductFactory;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import com.project.tech_gadget_store.modules.catalog.repository.CategoryRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.notification.event.ImportStockEvent;
import com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ImportLogItemRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ImportLogRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.NewProductImportDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.ImportLogResponseDto;
import com.project.tech_gadget_store.modules.warehouse.entity.ImportLog;
import com.project.tech_gadget_store.modules.warehouse.entity.ImportLogItem;
import com.project.tech_gadget_store.modules.warehouse.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.modules.warehouse.mapper.ImportLogMapper;
import com.project.tech_gadget_store.modules.warehouse.repository.ImportLogRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Slf4j
@Service
@Transactional(readOnly = true)
public class ImportLogService {

    private final ImportLogRepository importLogRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductSerialRepository productSerialRepository;
    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ImportLogMapper importLogMapper;
    private final ApplicationEventPublisher eventPublisher;

    public ImportLogService(ImportLogRepository importLogRepository,
                            ProductVariantRepository productVariantRepository,
                            ProductSerialRepository productSerialRepository,
                            UserRepository userRepository,
                            BrandRepository brandRepository,
                            CategoryRepository categoryRepository,
                            ProductRepository productRepository,
                            ImportLogMapper importLogMapper,
                            ApplicationEventPublisher eventPublisher) {
        this.importLogRepository = importLogRepository;
        this.productVariantRepository = productVariantRepository;
        this.productSerialRepository = productSerialRepository;
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.importLogMapper = importLogMapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ImportLogResponseDto importProducts(ImportLogRequestDto requestDto) {
        // 1. Validate performedById exists
        if (!userRepository.existsById(requestDto.getPerformedById())) {
            eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ImportStockEvent(
                    requestDto.getPerformedById(), false, "Performer not found"));
            throw new ResourceNotFoundException("Performer not found");
        }

        // Track initial stock values
        List<String> productIds = requestDto.getItems().stream()
                .map(item -> {
                    if (item.getProductVariantId() != null && !item.getProductVariantId().isBlank()) {
                        return productVariantRepository.findById(item.getProductVariantId())
                                .map(pv -> pv.getProduct().getId())
                                .orElse(null);
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        java.util.Map<String, Long> oldStocks = new java.util.HashMap<>();
        for (String id : productIds) {
            oldStocks.put(id, productVariantRepository.countAvailablePhysicalUnitsByProductId(id));
        }

        try {
            ImportLog importLog = ImportLog.builder()
                    .performedBy(requestDto.getPerformedById())
                    .status(ImportAndExportStatus.SUCCESS)
                    .note(requestDto.getNote())
                    .importedAt(java.time.LocalDateTime.now())
                    .build();

            for (ImportLogItemRequestDto itemDto : requestDto.getItems()) {
                int qty = itemDto.getQuantity();

                if (itemDto.getProductVariantId() != null && !itemDto.getProductVariantId().isBlank()) {
                    // Alternative Flow 5a: existing product variant
                    ProductVariant referenceVariant = productVariantRepository.findById(itemDto.getProductVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

                    for (int i = 0; i < qty; i++) {
                        ImportLogItem importLogItem = new ImportLogItem(importLog, referenceVariant, 1, itemDto.getImportPrice());
                        importLogItem.setId(java.util.UUID.randomUUID().toString());

                        String serial = (itemDto.getSerialNumbers() != null && itemDto.getSerialNumbers().size() > i)
                                ? itemDto.getSerialNumbers().get(i)
                                : "SR-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                        
                        ProductSerial productSerial = ProductSerial.builder()
                                .productVariant(referenceVariant)
                                .serialNumber(serial)
                                .status(SerialStatus.IN_STOCK)
                                .importItemId(importLogItem.getId())
                                .build();
                        productSerialRepository.save(productSerial);
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
                    Product product = ProductFactory.createProduct(category, newProductDto.getName(), newProductDto.getDescription(), brand);
                    productRepository.save(product);

                    ProductVariant newVariant = new ProductVariant(
                            product,
                            newProductDto.getRamGb(),
                            newProductDto.getStorageGb(),
                            newProductDto.getColor(),
                            newProductDto.getPrice()
                    );
                    productVariantRepository.save(newVariant);

                    for (int i = 0; i < qty; i++) {
                        ImportLogItem importLogItem = new ImportLogItem(importLog, newVariant, 1, itemDto.getImportPrice());
                        importLogItem.setId(java.util.UUID.randomUUID().toString());

                        String serial = (itemDto.getSerialNumbers() != null && itemDto.getSerialNumbers().size() > i)
                                ? itemDto.getSerialNumbers().get(i)
                                : "SR-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                        
                        ProductSerial productSerial = ProductSerial.builder()
                                .productVariant(newVariant)
                                .serialNumber(serial)
                                .status(SerialStatus.IN_STOCK)
                                .importItemId(importLogItem.getId())
                                .build();
                        productSerialRepository.save(productSerial);
                    }
                } else {
                    throw new IllegalArgumentException("Either productVariantId or newProduct must be provided");
                }
            }

            ImportLog savedLog = importLogRepository.save(importLog);

            // Publish ImportStockEvent success
            eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ImportStockEvent(
                    requestDto.getPerformedById(), true, requestDto.getNote()));

            // Publish ProductStockChangedEvent for existing products
            for (String id : productIds) {
                try {
                    Product product = productRepository.findById(id).orElse(null);
                    if (product != null) {
                        long oldStock = oldStocks.getOrDefault(id, 0L);
                        long newStock = productVariantRepository.countAvailablePhysicalUnitsByProductId(id);
                        eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent(product, oldStock, newStock));
                    }
                } catch (Exception e) {
                    log.error("Failed to publish ProductStockChangedEvent: {}", e.getMessage(), e);
                }
            }

            // Publish ProductStockChangedEvent for new products
            requestDto.getItems().stream()
                    .filter(item -> item.getNewProduct() != null)
                    .forEach(item -> {
                        try {
                            Product product = productRepository.findByNameIgnoreCase(item.getNewProduct().getName()).orElse(null);
                            if (product != null) {
                                long newStock = productVariantRepository.countAvailablePhysicalUnitsByProductId(product.getId());
                                eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent(product, 0L, newStock));
                            }
                        } catch (Exception e) {
                            log.error("Failed to publish ProductStockChangedEvent for new product: {}", e.getMessage(), e);
                        }
                    });

            return importLogMapper.toImportLogResponseDto(savedLog);

        } catch (Exception e) {
            // Publish ImportStockEvent failure
            eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ImportStockEvent(
                    requestDto.getPerformedById(), false, e.getMessage()));
            throw e;
        }
    }

    public List<ImportLogResponseDto> getAllImportLogs() {
        return importLogRepository.findAll().stream()
                .map(importLogMapper::toImportLogResponseDto)
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<ImportLogResponseDto> getImportLogsPaginated(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return importLogRepository.findAllByOrderByImportedAtDesc(pageable)
                .map(importLogMapper::toImportLogResponseDto);
    }

    public com.project.tech_gadget_store.common.dto.CursorPageResponseDto<ImportLogResponseDto> getImportLogsCursor(String cursor, int limit) {
        LocalDateTime cursorTimestamp = null;
        String cursorId = null;

        com.project.tech_gadget_store.common.util.CursorUtil.DecodedCursor decoded = com.project.tech_gadget_store.common.util.CursorUtil.decodeCursor(cursor);
        if (decoded != null) {
            cursorTimestamp = decoded.getTimestamp();
            cursorId = decoded.getId();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<ImportLog> logs = importLogRepository.findImportLogsCursor(cursorTimestamp, cursorId, pageable);

        boolean hasNext = logs.size() > limit;
        List<ImportLog> resultLogs = hasNext ? logs.subList(0, limit) : logs;

        List<ImportLogResponseDto> dtos = resultLogs.stream()
                .map(importLogMapper::toImportLogResponseDto)
                .collect(Collectors.toList());

        String nextCursor = null;
        if (hasNext && !resultLogs.isEmpty()) {
            ImportLog lastLog = resultLogs.get(resultLogs.size() - 1);
            nextCursor = com.project.tech_gadget_store.common.util.CursorUtil.encodeCursor(lastLog.getImportedAt(), lastLog.getId());
        }

        return new com.project.tech_gadget_store.common.dto.CursorPageResponseDto<>(dtos, nextCursor, hasNext);
    }
}
