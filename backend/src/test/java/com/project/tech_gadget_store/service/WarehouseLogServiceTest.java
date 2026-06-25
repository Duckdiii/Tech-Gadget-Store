package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.WarehouseLogFilterRequestDto;
import com.project.tech_gadget_store.dto.response.WarehouseLogResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.ExportLogRepository;
import com.project.tech_gadget_store.repository.ImportLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WarehouseLogServiceTest {

    @Mock
    private ImportLogRepository importLogRepository;
    @Mock
    private ExportLogRepository exportLogRepository;

    @InjectMocks
    private WarehouseLogService warehouseLogService;

    private ImportLog importLog;
    private ImportLogItem importLogItem;
    private ExportLog exportLog;
    private ExportLogItem exportLogItem;
    private ProductVariant variant;
    private Product product;

    void setUpMocks() {
        product = mock(Product.class);
        lenient().when(product.getName()).thenReturn("Test Laptop");

        variant = mock(ProductVariant.class);
        lenient().when(variant.getProduct()).thenReturn(product);
        lenient().when(variant.getDisplayName()).thenReturn("8GB RAM / 256GB Storage / Silver");
        lenient().when(variant.getPrice()).thenReturn(BigDecimal.valueOf(1000.00));

        // Set up ImportLog
        importLog = mock(ImportLog.class);
        lenient().when(importLog.getId()).thenReturn("import-log-1");
        lenient().when(importLog.getPerformedBy()).thenReturn("staff-1");
        lenient().when(importLog.getStatus()).thenReturn(ImportAndExportStatus.SUCCESS);
        lenient().when(importLog.getImportedAt()).thenReturn(LocalDateTime.of(2026, 6, 20, 10, 0));
        lenient().when(importLog.getNote()).thenReturn("Import Note");

        importLogItem = mock(ImportLogItem.class);
        lenient().when(importLogItem.getId()).thenReturn("import-item-1");
        lenient().when(importLogItem.getProductVariant()).thenReturn(variant);
        lenient().when(importLogItem.getQuantity()).thenReturn(10);
        lenient().when(importLogItem.getImportPrice()).thenReturn(BigDecimal.valueOf(900.00));

        lenient().when(importLog.getItems()).thenReturn(List.of(importLogItem));

        // Set up ExportLog
        exportLog = mock(ExportLog.class);
        lenient().when(exportLog.getId()).thenReturn("export-log-1");
        lenient().when(exportLog.getPerformedBy()).thenReturn("manager-1");
        lenient().when(exportLog.getStatus()).thenReturn(ImportAndExportStatus.SUCCESS);
        lenient().when(exportLog.getExportedAt()).thenReturn(LocalDateTime.of(2026, 6, 21, 14, 0));
        lenient().when(exportLog.getReason()).thenReturn("Export Reason");

        exportLogItem = mock(ExportLogItem.class);
        lenient().when(exportLogItem.getId()).thenReturn("export-item-1");
        lenient().when(exportLogItem.getProductVariant()).thenReturn(variant);
        lenient().when(exportLogItem.getQuantity()).thenReturn(2);

        lenient().when(exportLog.getItems()).thenReturn(List.of(exportLogItem));
    }

    @Test
    void getWarehouseLogs_AllLogs_Success() {
        setUpMocks();
        when(importLogRepository.findAll()).thenReturn(List.of(importLog));
        when(exportLogRepository.findAll()).thenReturn(List.of(exportLog));

        WarehouseLogFilterRequestDto filter = WarehouseLogFilterRequestDto.builder().build();
        List<WarehouseLogResponseDto> response = warehouseLogService.getWarehouseLogs(filter);

        assertNotNull(response);
        assertEquals(2, response.size());

        assertEquals("EXPORT", response.get(0).getType());
        assertEquals("export-item-1", response.get(0).getLogItemId());
        assertEquals("Test Laptop", response.get(0).getProductName());
        assertEquals(2, response.get(0).getQuantity());

        assertEquals("IMPORT", response.get(1).getType());
        assertEquals("import-item-1", response.get(1).getLogItemId());
        assertEquals(10, response.get(1).getQuantity());
        assertEquals(BigDecimal.valueOf(900.00), response.get(1).getPrice());
    }

    @Test
    void getWarehouseLogs_FilterByTypeImport_Success() {
        setUpMocks();
        when(importLogRepository.findAll()).thenReturn(List.of(importLog));

        WarehouseLogFilterRequestDto filter = WarehouseLogFilterRequestDto.builder()
                .type("IMPORT")
                .build();
        List<WarehouseLogResponseDto> response = warehouseLogService.getWarehouseLogs(filter);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("IMPORT", response.get(0).getType());
        assertEquals("import-item-1", response.get(0).getLogItemId());

        verify(exportLogRepository, never()).findAll();
    }

    @Test
    void getWarehouseLogs_InvalidFilterDate_ThrowsIllegalArgumentException() {
        WarehouseLogFilterRequestDto filter = WarehouseLogFilterRequestDto.builder()
                .startDate("2026-06-25")
                .endDate("2026-06-20")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> warehouseLogService.getWarehouseLogs(filter));
        assertEquals("Invalid filter input. Please check the selected conditions", ex.getMessage());
    }

    @Test
    void getWarehouseLogs_InvalidDateFormat_ThrowsIllegalArgumentException() {
        WarehouseLogFilterRequestDto filter = WarehouseLogFilterRequestDto.builder()
                .startDate("invalid-date")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> warehouseLogService.getWarehouseLogs(filter));
        assertEquals("Invalid filter input. Please check the selected conditions", ex.getMessage());
    }

    @Test
    void getWarehouseLogs_NoRecordsFound_ThrowsNoSuchElementException() {
        when(importLogRepository.findAll()).thenReturn(Collections.emptyList());
        when(exportLogRepository.findAll()).thenReturn(Collections.emptyList());

        WarehouseLogFilterRequestDto filter = WarehouseLogFilterRequestDto.builder().build();

        NoSuchElementException ex = assertThrows(NoSuchElementException.class,
                () -> warehouseLogService.getWarehouseLogs(filter));
        assertEquals("No warehouse log records were found matching the selected criteria", ex.getMessage());
    }

    @Test
    void getLogDetails_ImportRecord_Success() {
        setUpMocks();
        when(importLogRepository.findAll()).thenReturn(List.of(importLog));

        WarehouseLogResponseDto details = warehouseLogService.getLogDetails("import-item-1");

        assertNotNull(details);
        assertEquals("IMPORT", details.getType());
        assertEquals("import-log-1", details.getLogId());
        assertEquals("Test Laptop", details.getProductName());
        assertEquals(BigDecimal.valueOf(900.00), details.getPrice());
        assertEquals("Import Note", details.getNoteOrReason());
    }

    @Test
    void getLogDetails_ExportRecord_Success() {
        setUpMocks();
        when(importLogRepository.findAll()).thenReturn(Collections.emptyList());
        when(exportLogRepository.findAll()).thenReturn(List.of(exportLog));

        WarehouseLogResponseDto details = warehouseLogService.getLogDetails("export-item-1");

        assertNotNull(details);
        assertEquals("EXPORT", details.getType());
        assertEquals("export-log-1", details.getLogId());
        assertEquals("Test Laptop", details.getProductName());
        assertEquals("Export Reason", details.getNoteOrReason());
    }

    @Test
    void getLogDetails_RecordNotFound_ThrowsResourceNotFoundException() {
        when(importLogRepository.findAll()).thenReturn(Collections.emptyList());
        when(exportLogRepository.findAll()).thenReturn(Collections.emptyList());

        assertThrows(ResourceNotFoundException.class,
                () -> warehouseLogService.getLogDetails("non-existent-item"));
    }

    @Test
    void exportWarehouseLogsToCsv_Success() {
        setUpMocks();
        when(importLogRepository.findAll()).thenReturn(List.of(importLog));
        when(exportLogRepository.findAll()).thenReturn(List.of(exportLog));

        WarehouseLogFilterRequestDto filter = WarehouseLogFilterRequestDto.builder().build();
        String csv = warehouseLogService.exportWarehouseLogsToCsv(filter);

        assertNotNull(csv);
        assertTrue(csv.contains("Log Item ID,Log ID,Log Type,Product Name,Specs,Quantity,Price,Performed By,Status,Created Time,Note/Reason"));
        assertTrue(csv.contains("import-item-1,import-log-1,IMPORT,Test Laptop"));
        assertTrue(csv.contains("export-item-1,export-log-1,EXPORT,Test Laptop"));
    }
}
