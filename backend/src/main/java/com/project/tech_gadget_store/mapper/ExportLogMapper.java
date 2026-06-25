package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.ExportLogItemResponseDto;
import com.project.tech_gadget_store.dto.response.ExportLogResponseDto;
import com.project.tech_gadget_store.entity.ExportLog;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ExportLogMapper {

    public ExportLogResponseDto toExportLogResponseDto(ExportLog exportLog, String receiptId, String message) {
        List<ExportLogItemResponseDto> itemDtos = exportLog.getItems().stream()
                .map(item -> ExportLogItemResponseDto.builder()
                        .id(item.getId())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .exportLogId(exportLog.getId())
                        .productVariantId(item.getProductVariant().getId())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        BigDecimal totalValue = exportLog.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProductVariant().getPrice();
                    return price != null ? price.multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ExportLogResponseDto.builder()
                .id(exportLog.getId())
                .createdAt(exportLog.getCreatedAt())
                .updatedAt(exportLog.getUpdatedAt())
                .items(itemDtos)
                .exportedAt(exportLog.getExportedAt())
                .reason(exportLog.getReason())
                .status(exportLog.getStatus())
                .performedById(exportLog.getPerformedBy())
                .receiptId(receiptId)
                .totalQuantity(exportLog.calculateTotalQuantity())
                .totalValue(totalValue)
                .message(message)
                .build();
    }
}
