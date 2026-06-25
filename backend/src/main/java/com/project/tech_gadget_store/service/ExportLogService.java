package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ExportLogItemRequestDto;
import com.project.tech_gadget_store.dto.request.ExportLogRequestDto;
import com.project.tech_gadget_store.dto.response.ExportLogResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.entity.enums.NotificationType;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.ExportLogMapper;
import com.project.tech_gadget_store.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class ExportLogService {

    private final ExportLogRepository exportLogRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final ReceiptRepository receiptRepository;
    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;
    private final ExportLogMapper exportLogMapper;

    public ExportLogService(ExportLogRepository exportLogRepository,
            ProductVariantRepository productVariantRepository,
            UserRepository userRepository,
            ReceiptRepository receiptRepository,
            NotificationRepository notificationRepository,
            CustomerRepository customerRepository,
            ExportLogMapper exportLogMapper) {
        this.exportLogRepository = exportLogRepository;
        this.productVariantRepository = productVariantRepository;
        this.userRepository = userRepository;
        this.receiptRepository = receiptRepository;
        this.notificationRepository = notificationRepository;
        this.customerRepository = customerRepository;
        this.exportLogMapper = exportLogMapper;
    }

    @Transactional
    public ExportLogResponseDto exportProducts(ExportLogRequestDto requestDto) {
        // 1. Validate performedById exists
        if (!userRepository.existsById(requestDto.getPerformedById())) {
            throw new ResourceNotFoundException("Performer not found");
        }

        // Create export log
        ExportLog exportLog = new ExportLog(requestDto.getPerformedById(), requestDto.getReason(),
                ImportAndExportStatus.SUCCESS);

        for (ExportLogItemRequestDto itemDto : requestDto.getItems()) {
            // Find reference variant to get specs
            ProductVariant referenceVariant = productVariantRepository.findById(itemDto.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

            // Find available physical units
            List<ProductVariant> availableUnits = productVariantRepository.findAvailablePhysicalUnits( // trả về danh
                                                                                                       // sách các đơn
                                                                                                       // vị vật lý có
                                                                                                       // sẵn
                    referenceVariant.getProduct().getId(),
                    referenceVariant.getRamGb(),
                    referenceVariant.getStorageGb(),
                    referenceVariant.getColor());

            if (availableUnits.size() < itemDto.getQuantity()) {
                throw new IllegalArgumentException("Insufficient product quantity in inventory");
            }

            // Select quantity physical units and link to export log
            for (int i = 0; i < itemDto.getQuantity(); i++) {
                ProductVariant unitToExport = availableUnits.get(i);
                new ExportLogItem(exportLog, unitToExport, 1);
            }
        }

        // Save export log (CascadeType.ALL will save the export log items)
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

        // 3. Notify Inventory Change Status
        try {
            if ("FORCE_NOTIFICATION_FAILURE".equalsIgnoreCase(requestDto.getReason())) {
                throw new RuntimeException("Simulated notification failure");
            }
            List<Customer> customers = customerRepository.findAll();
            if (!customers.isEmpty()) {
                Customer customer = customers.get(0);
                Notification notification = new Notification(
                        customer,
                        "Stock Exported",
                        NotificationType.STOCK_CHANGE,
                        "Inventory updated for exported products",
                        List.of(NotificationChannel.WEB));
                notification.markSent();
                notificationRepository.save(notification);
            } else {
                throw new IllegalStateException("No customers available to receive notifications");
            }
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage(), e);
            notificationFailed = true;
        }

        // Determine message based on failures
        String message;
        if (receiptFailed) {
            message = "Products were exported, but the receipt could not be generated";
        } else if (notificationFailed) {
            message = "Inventory was updated, but notification status could not be displayed";
        } else {
            message = "Products exported successfully.";
        }

        return exportLogMapper.toExportLogResponseDto(savedLog, receiptId, message);
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
}
