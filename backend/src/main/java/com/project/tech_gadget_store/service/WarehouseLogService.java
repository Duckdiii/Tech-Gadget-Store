package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.WarehouseLogFilterRequestDto;
import com.project.tech_gadget_store.dto.response.WarehouseLogResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.ExportLogRepository;
import com.project.tech_gadget_store.repository.ImportLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
public class WarehouseLogService {

    private final ImportLogRepository importLogRepository;
    private final ExportLogRepository exportLogRepository;

    public WarehouseLogService(ImportLogRepository importLogRepository,
            ExportLogRepository exportLogRepository) {
        this.importLogRepository = importLogRepository;
        this.exportLogRepository = exportLogRepository;
    }

    public List<WarehouseLogResponseDto> getWarehouseLogs(WarehouseLogFilterRequestDto filter) {
        LocalDate start = null;
        LocalDate end = null;

        if (filter.getStartDate() != null && !filter.getStartDate().isBlank()) {
            try {
                start = LocalDate.parse(filter.getStartDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check the selected conditions");
            }
        }

        if (filter.getEndDate() != null && !filter.getEndDate().isBlank()) {
            try {
                end = LocalDate.parse(filter.getEndDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check the selected conditions");
            }
        }

        if (start != null && end != null && start.isAfter(end)) {
            throw new IllegalArgumentException("Invalid filter input. Please check the selected conditions");
        }

        List<WarehouseLogResponseDto> results = new ArrayList<>();

        // Fetch imports
        if (filter.getType() == null || filter.getType().isBlank() || "IMPORT".equalsIgnoreCase(filter.getType())) {
            List<ImportLog> imports = importLogRepository.findAll();
            for (ImportLog il : imports) {
                for (ImportLogItem item : il.getItems()) {
                    WarehouseLogResponseDto dto = mapImportItem(il, item);
                    if (matchesFilter(dto, filter, start, end)) {
                        results.add(dto);
                    }
                }
            }
        }

        // Fetch exports
        if (filter.getType() == null || filter.getType().isBlank() || "EXPORT".equalsIgnoreCase(filter.getType())) {
            List<ExportLog> exports = exportLogRepository.findAll();
            for (ExportLog el : exports) {
                for (ExportLogItem item : el.getItems()) {
                    WarehouseLogResponseDto dto = mapExportItem(el, item);
                    if (matchesFilter(dto, filter, start, end)) {
                        results.add(dto);
                    }
                }
            }
        }

        // Sort by createdTime descending (newest first)
        results.sort(Comparator.comparing(WarehouseLogResponseDto::getCreatedTime).reversed());

        // Check if empty (Exception 6b)
        if (results.isEmpty()) {
            throw new java.util.NoSuchElementException(
                    "No warehouse log records were found matching the selected criteria");
        }

        return results;
    }

    public WarehouseLogResponseDto getLogDetails(String logItemId) {
        // Search in ImportLogItem
        List<ImportLog> imports = importLogRepository.findAll();
        for (ImportLog il : imports) {
            for (ImportLogItem item : il.getItems()) {
                if (item.getId().equals(logItemId)) {
                    return mapImportItem(il, item);
                }
            }
        }

        // Search in ExportLogItem
        List<ExportLog> exports = exportLogRepository.findAll();
        for (ExportLog el : exports) {
            for (ExportLogItem item : el.getItems()) {
                if (item.getId().equals(logItemId)) {
                    return mapExportItem(el, item);
                }
            }
        }

        throw new ResourceNotFoundException("Warehouse log record not found");
    }

    public String exportWarehouseLogsToCsv(WarehouseLogFilterRequestDto filter) {
        List<WarehouseLogResponseDto> logs = getWarehouseLogs(filter);
        StringBuilder sb = new StringBuilder();
        sb.append(
                "Log Item ID,Log ID,Log Type,Product Name,Specs,Quantity,Price,Performed By,Status,Created Time,Note/Reason\n");
        for (WarehouseLogResponseDto log : logs) {
            sb.append(escapeCsv(log.getLogItemId())).append(",")
                    .append(escapeCsv(log.getLogId())).append(",")
                    .append(escapeCsv(log.getType())).append(",")
                    .append(escapeCsv(log.getProductName())).append(",")
                    .append(escapeCsv(log.getProductDetails())).append(",")
                    .append(log.getQuantity()).append(",")
                    .append(log.getPrice()).append(",")
                    .append(escapeCsv(log.getPerformedBy())).append(",")
                    .append(escapeCsv(log.getStatus())).append(",")
                    .append(log.getCreatedTime()).append(",")
                    .append(escapeCsv(log.getNoteOrReason())).append("\n");
        }
        return sb.toString();
    }

    // Kiểm tra xem một bản ghi WarehouseLogResponseDto có khớp với các điều kiện
    // lọc hay không
    private boolean matchesFilter(WarehouseLogResponseDto dto, WarehouseLogFilterRequestDto filter, LocalDate start,
            LocalDate end) {
        if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
            if (dto.getProductName() == null
                    || !dto.getProductName().toLowerCase().contains(filter.getKeyword().toLowerCase())) {
                return false;
            }
        }
        if (filter.getPerformedBy() != null && !filter.getPerformedBy().isBlank()) {
            if (dto.getPerformedBy() == null || !dto.getPerformedBy().equalsIgnoreCase(filter.getPerformedBy())) {
                return false;
            }
        }
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            if (dto.getStatus() == null || !dto.getStatus().equalsIgnoreCase(filter.getStatus())) {
                return false;
            }
        }
        if (start != null) {
            if (dto.getCreatedTime() == null || dto.getCreatedTime().toLocalDate().isBefore(start)) {
                return false;
            }
        }
        if (end != null) {
            if (dto.getCreatedTime() == null || dto.getCreatedTime().toLocalDate().isAfter(end)) {
                return false;
            }
        }
        return true;
    }

    private WarehouseLogResponseDto mapImportItem(ImportLog il, ImportLogItem item) {
        ProductVariant variant = item.getProductVariant();
        return WarehouseLogResponseDto.builder()
                .logId(il.getId())
                .logItemId(item.getId())
                .type("IMPORT")
                .productName(variant.getProduct().getName())
                .quantity(item.getQuantity())
                .performedBy(il.getPerformedBy())
                .status(il.getStatus().name())
                .createdTime(il.getImportedAt())
                .price(item.getImportPrice())
                .noteOrReason(il.getNote())
                .productDetails(variant.getDisplayName())
                .build();
    }

    private WarehouseLogResponseDto mapExportItem(ExportLog el, ExportLogItem item) {
        ProductVariant variant = item.getProductVariant();
        return WarehouseLogResponseDto.builder()
                .logId(el.getId())
                .logItemId(item.getId())
                .type("EXPORT")
                .productName(variant.getProduct().getName())
                .quantity(item.getQuantity())
                .performedBy(el.getPerformedBy())
                .status(el.getStatus().name())
                .createdTime(el.getExportedAt())
                .price(variant.getPrice())
                .noteOrReason(el.getReason())
                .productDetails(variant.getDisplayName())
                .build();
    }

    private String escapeCsv(String val) {
        if (val == null) {
            return "";
        }
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
