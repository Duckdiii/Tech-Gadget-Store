package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.ImportLogItemResponseDto;
import com.project.tech_gadget_store.dto.response.ImportLogResponseDto;
import com.project.tech_gadget_store.entity.ImportLog;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

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
