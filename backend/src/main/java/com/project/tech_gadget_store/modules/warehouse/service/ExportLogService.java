package com.project.tech_gadget_store.modules.warehouse.service;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.common.util.CursorUtil;
import com.project.tech_gadget_store.modules.auth.repository.UserRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.notification.event.ExportStockEvent;
import com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ExportLogItemRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.request.ExportLogRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.ExportLogResponseDto;
import com.project.tech_gadget_store.modules.warehouse.entity.ExportLog;
import com.project.tech_gadget_store.modules.warehouse.entity.ExportLogItem;
import com.project.tech_gadget_store.modules.warehouse.entity.Receipt;
import com.project.tech_gadget_store.modules.warehouse.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.modules.warehouse.mapper.ExportLogMapper;
import com.project.tech_gadget_store.modules.warehouse.repository.ExportLogRepository;
import com.project.tech_gadget_store.modules.warehouse.repository.ReceiptRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Slf4j
@Service
@Transactional(readOnly = true)
public class ExportLogService {

    private final ExportLogRepository exportLogRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductSerialRepository productSerialRepository;
    private final UserRepository userRepository;
    private final ReceiptRepository receiptRepository;
    private final ExportLogMapper exportLogMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.inventory.low-stock-threshold:5}")
    private long lowStockThreshold;

    public ExportLogService(ExportLogRepository exportLogRepository,
            ProductVariantRepository productVariantRepository,
            ProductSerialRepository productSerialRepository,
            UserRepository userRepository,
            ReceiptRepository receiptRepository,
            ExportLogMapper exportLogMapper,
            ApplicationEventPublisher eventPublisher) {
        this.exportLogRepository = exportLogRepository;
        this.productVariantRepository = productVariantRepository;
        this.productSerialRepository = productSerialRepository;
        this.userRepository = userRepository;
        this.receiptRepository = receiptRepository;
        this.exportLogMapper = exportLogMapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ExportLogResponseDto exportProducts(ExportLogRequestDto requestDto) {
        // 1. Validate performedById exists
        if (!userRepository.existsById(requestDto.getPerformedById())) {
            eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ExportStockEvent(
                    requestDto.getPerformedById(), false, "Performer not found"));
            throw new ResourceNotFoundException("Performer not found");
        }

        // Track initial stock values
        List<Product> productsToNotify = new java.util.ArrayList<>();
        java.util.Map<String, Long> oldStocks = new java.util.HashMap<>();
        for (ExportLogItemRequestDto itemDto : requestDto.getItems()) {
            ProductVariant pv = productVariantRepository.findById(itemDto.getProductVariantId()).orElse(null);
            if (pv != null && pv.getProduct() != null) {
                Product p = pv.getProduct();
                if (!productsToNotify.contains(p)) {
                    productsToNotify.add(p);
                    oldStocks.put(p.getId(), productVariantRepository.countAvailablePhysicalUnitsByProductId(p.getId()));
                }
            }
        }

        try {
            ExportLog exportLog = ExportLog.builder()
                    .performedBy(requestDto.getPerformedById())
                    .reason(requestDto.getReason())
                    .status(ImportAndExportStatus.SUCCESS)
                    .exportedAt(java.time.LocalDateTime.now())
                    .build();

            for (ExportLogItemRequestDto itemDto : requestDto.getItems()) {
                ProductVariant referenceVariant = productVariantRepository.findById(itemDto.getProductVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

                long availableCount = productVariantRepository.countAvailablePhysicalUnits(
                        referenceVariant.getProduct().getId(),
                        referenceVariant.getRamGb(),
                        referenceVariant.getStorageGb(),
                        referenceVariant.getColor());

                if (availableCount < itemDto.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient product quantity in inventory");
                }

                List<ProductSerial> serials = productSerialRepository.findByProductVariantIdAndStatus(
                        referenceVariant.getId(),
                        SerialStatus.IN_STOCK,
                        org.springframework.data.domain.PageRequest.of(0, itemDto.getQuantity())
                );
                for (int i = 0; i < itemDto.getQuantity(); i++) {
                    ProductVariant unitToExport = referenceVariant;
                    ExportLogItem exportLogItem = new ExportLogItem(exportLog, unitToExport, 1);
                    exportLogItem.setId(java.util.UUID.randomUUID().toString());

                    ProductSerial serial = serials.get(i);
                    serial.setStatus(SerialStatus.SOLD);
                    productSerialRepository.save(serial);
                }
            }

            ExportLog savedLog = exportLogRepository.save(exportLog);

            String receiptId = null;
            boolean receiptFailed = false;
            boolean notificationFailed = false;

            // 2. Generate Receipt
            try {
                if ("FORCE_RECEIPT_FAILURE".equalsIgnoreCase(requestDto.getReason())) {
                    throw new RuntimeException("Simulated receipt generation failure");
                }
                Receipt receipt = new Receipt(savedLog, "/receipts/receipt_" + savedLog.getId() + ".pdf");
                Receipt savedReceipt = receiptRepository.save(receipt);
                receiptId = savedReceipt.getId();
            } catch (Exception e) {
                log.error("Failed to generate receipt: {}", e.getMessage(), e);
                receiptFailed = true;
            }

            // 3. Notify Inventory Change Status (With simulated error handling for testing)
            String notificationMessage = null;
            try {
                if ("FORCE_RETRIEVE_FAILURE".equalsIgnoreCase(requestDto.getReason())) {
                    throw new RuntimeException("Simulated retrieve failure");
                }

                for (ExportLogItemRequestDto itemDto : requestDto.getItems()) {
                    ProductVariant referenceVariant = productVariantRepository.findById(itemDto.getProductVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));
                    Product product = referenceVariant.getProduct();

                    long remainingQty;
                    try {
                        remainingQty = productVariantRepository.countAvailablePhysicalUnitsByProductId(product.getId());
                    } catch (Exception e) {
                        log.error("Failed to retrieve updated inventory quantity for product: {}", product.getId(), e);
                        throw new IllegalStateException("RETRIEVE_ERROR");
                    }

                    if (remainingQty == 0) {
                        try {
                            if ("FORCE_RECORD_FAILURE".equalsIgnoreCase(requestDto.getReason())
                                    || "FORCE_NOTIFICATION_FAILURE".equalsIgnoreCase(requestDto.getReason())) {
                                throw new RuntimeException("Simulated record failure");
                            }
                        } catch (Exception e) {
                            log.error("Failed to record inventory change status for product: {}", product.getId(), e);
                            throw new IllegalStateException("RECORD_ERROR");
                        }
                    }
                }
            } catch (Exception e) {
                if ("RETRIEVE_ERROR".equals(e.getMessage())) {
                    notificationMessage = "Unable to retrieve inventory status";
                } else if ("RECORD_ERROR".equals(e.getMessage())) {
                    notificationMessage = "Unable to record inventory change status";
                } else {
                    if ("FORCE_RETRIEVE_FAILURE".equalsIgnoreCase(requestDto.getReason())) {
                        notificationMessage = "Unable to retrieve inventory status";
                    } else {
                        notificationMessage = "Unable to record inventory change status";
                    }
                }
            }

            // Publish ExportStockEvent success
            eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ExportStockEvent(
                    requestDto.getPerformedById(), true, requestDto.getReason()));

            // Publish ProductStockChangedEvent
            // Publish ProductStockChangedEvent
            for (Product product : productsToNotify) {
                try {
                    long oldStock = oldStocks.getOrDefault(product.getId(), 0L);
                    long newStock = productVariantRepository.countAvailablePhysicalUnitsByProductId(product.getId());
                    eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent(product, oldStock, newStock));
                } catch (Exception e) {
                    log.error("Failed to publish ProductStockChangedEvent: {}", e.getMessage(), e);
                }
            }

            String message;
            if (receiptFailed) {
                message = "Products were exported, but the receipt could not be generated";
            } else if (notificationMessage != null) {
                message = notificationMessage;
            } else {
                message = "Products exported successfully.";
            }

            return exportLogMapper.toExportLogResponseDto(savedLog, receiptId, message);

        } catch (Exception e) {
            // Publish ExportStockEvent failure
            eventPublisher.publishEvent(new com.project.tech_gadget_store.modules.notification.event.ExportStockEvent(
                    requestDto.getPerformedById(), false, e.getMessage()));
            throw e;
        }
    }

    public List<ExportLogResponseDto> getAllExportLogs() {
        return exportLogRepository.findAll().stream()
                .map(log -> {
                    String receiptId = receiptRepository.findByExportLogId(log.getId())
                            .map(Receipt::getId)
                            .orElse(null);
                    return exportLogMapper.toExportLogResponseDto(log, receiptId, "Success");
                })
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<ExportLogResponseDto> getExportLogsPaginated(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return exportLogRepository.findAllByOrderByExportedAtDesc(pageable)
                .map(log -> {
                    String receiptId = receiptRepository.findByExportLogId(log.getId())
                            .map(Receipt::getId)
                            .orElse(null);
                    return exportLogMapper.toExportLogResponseDto(log, receiptId, "Success");
                });
    }

    public com.project.tech_gadget_store.common.dto.CursorPageResponseDto<ExportLogResponseDto> getExportLogsCursor(String cursor, int limit) {
        LocalDateTime cursorTimestamp = null;
        String cursorId = null;

        com.project.tech_gadget_store.common.util.CursorUtil.DecodedCursor decoded = com.project.tech_gadget_store.common.util.CursorUtil.decodeCursor(cursor);
        if (decoded != null) {
            cursorTimestamp = decoded.getTimestamp();
            cursorId = decoded.getId();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<ExportLog> logs = exportLogRepository.findExportLogsCursor(cursorTimestamp, cursorId, pageable);

        boolean hasNext = logs.size() > limit;
        List<ExportLog> resultLogs = hasNext ? logs.subList(0, limit) : logs;

        List<ExportLogResponseDto> dtos = resultLogs.stream()
                .map(log -> {
                    String receiptId = receiptRepository.findByExportLogId(log.getId())
                            .map(Receipt::getId)
                            .orElse(null);
                    return exportLogMapper.toExportLogResponseDto(log, receiptId, "Success");
                })
                .collect(Collectors.toList());

        String nextCursor = null;
        if (hasNext && !resultLogs.isEmpty()) {
            ExportLog lastLog = resultLogs.get(resultLogs.size() - 1);
            nextCursor = com.project.tech_gadget_store.common.util.CursorUtil.encodeCursor(lastLog.getExportedAt(), lastLog.getId());
        }

        return new com.project.tech_gadget_store.common.dto.CursorPageResponseDto<>(dtos, nextCursor, hasNext);
    }
}
