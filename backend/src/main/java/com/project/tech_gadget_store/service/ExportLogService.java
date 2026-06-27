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
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
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
    private final FavoriteProductRepository favoriteProductRepository;
    private final ExportLogMapper exportLogMapper;

    public ExportLogService(ExportLogRepository exportLogRepository,
            ProductVariantRepository productVariantRepository,
            UserRepository userRepository,
            ReceiptRepository receiptRepository,
            NotificationRepository notificationRepository,
            CustomerRepository customerRepository,
            FavoriteProductRepository favoriteProductRepository,
            ExportLogMapper exportLogMapper) {
        this.exportLogRepository = exportLogRepository;
        this.productVariantRepository = productVariantRepository;
        this.userRepository = userRepository;
        this.receiptRepository = receiptRepository;
        this.notificationRepository = notificationRepository;
        this.customerRepository = customerRepository;
        this.favoriteProductRepository = favoriteProductRepository;
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

            // Trả về số lượng đơn vị vật lý có sẵn dựa trên các thông số kỹ thuật của biến
            // thể sản phẩm tham chiếu
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
        String notificationMessage = null;
        try {
            if ("FORCE_RETRIEVE_FAILURE".equalsIgnoreCase(requestDto.getReason())) {
                throw new RuntimeException("Simulated retrieve failure");
            }

            for (ExportLogItemRequestDto itemDto : requestDto.getItems()) {
                ProductVariant referenceVariant = productVariantRepository.findById(itemDto.getProductVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));
                Product product = referenceVariant.getProduct();

                // Retrieve updated quantity
                long remainingQty;
                try {
                    remainingQty = productVariantRepository.countAvailablePhysicalUnitsByProductId(product.getId());
                } catch (Exception e) {
                    log.error("Failed to retrieve updated inventory quantity for product: {}", product.getId(), e);
                    throw new IllegalStateException("RETRIEVE_ERROR");
                }

                // Determine inventory status & record inventory change status
                if (remainingQty == 0) {
                    try {
                        if ("FORCE_RECORD_FAILURE".equalsIgnoreCase(requestDto.getReason())
                                || "FORCE_NOTIFICATION_FAILURE".equalsIgnoreCase(requestDto.getReason())) {
                            throw new RuntimeException("Simulated record failure");
                        }

                        List<FavoriteProduct> subscriptions = favoriteProductRepository.findByProductIdAndStatus(
                                product.getId(), SubscriptionStatus.SUBSCRIBED);

                        for (FavoriteProduct sub : subscriptions) {
                            Notification notification = new Notification(
                                    sub.getCustomer(),
                                    "Stock Out",
                                    NotificationType.STOCK_CHANGE,
                                    "Sản phẩm " + product.getName() + " đã hết hàng (Out of Stock).",
                                    List.of(NotificationChannel.WEB));
                            notification.markSent();
                            notificationRepository.save(notification);
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

        // Determine message based on failures
        String message;
        if (receiptFailed) {
            message = "Products were exported, but the receipt could not be generated";
        } else if (notificationMessage != null) {
            message = notificationMessage;
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
