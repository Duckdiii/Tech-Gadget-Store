package com.project.tech_gadget_store.modules.warehouse.mapper;

import com.project.tech_gadget_store.modules.warehouse.dto.response.ImportLogItemResponseDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.ImportLogResponseDto;
import com.project.tech_gadget_store.modules.warehouse.entity.ImportLog;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;



@Component
public class ImportLogMapper {

    public ImportLogResponseDto toImportLogResponseDto(ImportLog importLog) {
        List<ImportLogItemResponseDto> itemDtos = importLog.getItems().stream()
                .map(item -> ImportLogItemResponseDto.builder()
                        .id(item.getId())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .importLogId(importLog.getId())
                        .productVariantId(item.getProductVariant().getId())
                        .quantity(item.getQuantity())
                        .importPrice(item.getImportPrice())
                        .build())
                .collect(Collectors.toList());

        return ImportLogResponseDto.builder()
                .id(importLog.getId())
                .createdAt(importLog.getCreatedAt())
                .updatedAt(importLog.getUpdatedAt())
                .performedById(importLog.getPerformedBy())
                .importedAt(importLog.getImportedAt())
                .status(importLog.getStatus())
                .note(importLog.getNote())
                .items(itemDtos)
                .totalQuantity(importLog.calculateTotalQuantity())
                .totalValue(importLog.calculateTotalImportValue())
                .build();
    }
}
