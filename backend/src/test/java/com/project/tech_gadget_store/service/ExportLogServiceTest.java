package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ExportLogItemRequestDto;
import com.project.tech_gadget_store.dto.request.ExportLogRequestDto;
import com.project.tech_gadget_store.dto.response.ExportLogResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.mapper.ExportLogMapper;
import com.project.tech_gadget_store.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExportLogServiceTest {

    @Mock
    private ExportLogRepository exportLogRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReceiptRepository receiptRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ExportLogMapper exportLogMapper;

    @InjectMocks
    private ExportLogService exportLogService;

    private Product product;
    private ProductVariant variant;
    private Customer customer;

    @BeforeEach
    void setUp() {
        product = mock(Product.class);
        variant = mock(ProductVariant.class);
        customer = mock(Customer.class);
    }

    @Test
    void exportProducts_PerformerNotFound_ThrowsResourceNotFoundException() {
        ExportLogRequestDto requestDto = ExportLogRequestDto.builder()
                .performedById("invalid-id")
                .items(List.of(ExportLogItemRequestDto.builder().build()))
                .build();

        when(userRepository.existsById("invalid-id")).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> exportLogService.exportProducts(requestDto));
        verify(exportLogRepository, never()).save(any());
    }

    @Test
    void exportProducts_InsufficientQuantity_ThrowsIllegalArgumentException() {
        ExportLogRequestDto requestDto = ExportLogRequestDto.builder()
                .performedById("performer-id")
                .items(List.of(
                        ExportLogItemRequestDto.builder()
                                .productVariantId("variant-id")
                                .quantity(5)
                                .build()
                ))
                .build();

        when(userRepository.existsById("performer-id")).thenReturn(true);
        when(productVariantRepository.findById("variant-id")).thenReturn(Optional.of(variant));
        when(variant.getProduct()).thenReturn(product);
        when(product.getId()).thenReturn("product-id");
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Silver");

        // mock return 3 available units (less than 5 requested)
        when(productVariantRepository.findAvailablePhysicalUnits("product-id", 8, 256, "Silver"))
                .thenReturn(List.of(mock(ProductVariant.class), mock(ProductVariant.class), mock(ProductVariant.class)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> exportLogService.exportProducts(requestDto));
        assertEquals("Insufficient product quantity in inventory", ex.getMessage());
        verify(exportLogRepository, never()).save(any());
    }

    @Test
    void exportProducts_Success_FullFlow() {
        ExportLogRequestDto requestDto = ExportLogRequestDto.builder()
                .performedById("performer-id")
                .items(List.of(
                        ExportLogItemRequestDto.builder()
                                .productVariantId("variant-id")
                                .quantity(2)
                                .build()
                ))
                .reason("Test Export")
                .build();

        when(userRepository.existsById("performer-id")).thenReturn(true);
        when(productVariantRepository.findById("variant-id")).thenReturn(Optional.of(variant));
        when(variant.getProduct()).thenReturn(product);
        when(product.getId()).thenReturn("product-id");
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Silver");

        ProductVariant unit1 = mock(ProductVariant.class);
        ProductVariant unit2 = mock(ProductVariant.class);
        when(productVariantRepository.findAvailablePhysicalUnits("product-id", 8, 256, "Silver"))
                .thenReturn(List.of(unit1, unit2));

        when(exportLogRepository.save(any(ExportLog.class))).thenAnswer(inv -> {
            ExportLog el = inv.getArgument(0);
            el.setId("export-log-id");
            return el;
        });

        // Mock Receipt save
        Receipt receipt = mock(Receipt.class);
        when(receipt.getId()).thenReturn("receipt-id");
        when(receiptRepository.save(any(Receipt.class))).thenReturn(receipt);

        // Mock Customer exist for Notification
        when(customerRepository.findAll()).thenReturn(List.of(customer));
        when(customer.getNotifications()).thenReturn(new java.util.ArrayList<>());

        // Mock Mapper
        when(exportLogMapper.toExportLogResponseDto(any(ExportLog.class), eq("receipt-id"), eq("Products exported successfully.")))
                .thenReturn(ExportLogResponseDto.builder()
                        .id("export-log-id")
                        .performedById("performer-id")
                        .receiptId("receipt-id")
                        .status(ImportAndExportStatus.SUCCESS)
                        .message("Products exported successfully.")
                        .build());

        ExportLogResponseDto response = exportLogService.exportProducts(requestDto);

        assertNotNull(response);
        assertEquals("export-log-id", response.getId());
        assertEquals("receipt-id", response.getReceiptId());
        assertEquals("Products exported successfully.", response.getMessage());

        verify(receiptRepository).save(any(Receipt.class));
        verify(notificationRepository).save(any(Notification.class));
        verify(exportLogRepository).save(any(ExportLog.class));
    }

    @Test
    void exportProducts_ReceiptGenerationFails_SavesExportButReturnsWarningMessage() {
        ExportLogRequestDto requestDto = ExportLogRequestDto.builder()
                .performedById("performer-id")
                .items(List.of(
                        ExportLogItemRequestDto.builder()
                                .productVariantId("variant-id")
                                .quantity(1)
                                .build()
                ))
                .reason("FORCE_RECEIPT_FAILURE")
                .build();

        when(userRepository.existsById("performer-id")).thenReturn(true);
        when(productVariantRepository.findById("variant-id")).thenReturn(Optional.of(variant));
        when(variant.getProduct()).thenReturn(product);
        when(product.getId()).thenReturn("product-id");
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Silver");

        ProductVariant unit1 = mock(ProductVariant.class);
        when(productVariantRepository.findAvailablePhysicalUnits("product-id", 8, 256, "Silver"))
                .thenReturn(List.of(unit1));

        when(exportLogRepository.save(any(ExportLog.class))).thenAnswer(inv -> {
            ExportLog el = inv.getArgument(0);
            el.setId("export-log-id");
            return el;
        });

        // Mock Customer exist for Notification
        when(customerRepository.findAll()).thenReturn(List.of(customer));
        when(customer.getNotifications()).thenReturn(new java.util.ArrayList<>());

        // Mock Mapper to expect null receiptId and warning message
        when(exportLogMapper.toExportLogResponseDto(any(ExportLog.class), isNull(), eq("Products were exported, but the receipt could not be generated")))
                .thenReturn(ExportLogResponseDto.builder()
                        .id("export-log-id")
                        .performedById("performer-id")
                        .receiptId(null)
                        .status(ImportAndExportStatus.SUCCESS)
                        .message("Products were exported, but the receipt could not be generated")
                        .build());

        ExportLogResponseDto response = exportLogService.exportProducts(requestDto);

        assertNotNull(response);
        assertEquals("export-log-id", response.getId());
        assertNull(response.getReceiptId());
        assertEquals("Products were exported, but the receipt could not be generated", response.getMessage());

        verify(receiptRepository, never()).save(any(Receipt.class));
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void exportProducts_NotificationFails_SavesExportButReturnsWarningMessage() {
        ExportLogRequestDto requestDto = ExportLogRequestDto.builder()
                .performedById("performer-id")
                .items(List.of(
                        ExportLogItemRequestDto.builder()
                                .productVariantId("variant-id")
                                .quantity(1)
                                .build()
                ))
                .reason("FORCE_NOTIFICATION_FAILURE")
                .build();

        when(userRepository.existsById("performer-id")).thenReturn(true);
        when(productVariantRepository.findById("variant-id")).thenReturn(Optional.of(variant));
        when(variant.getProduct()).thenReturn(product);
        when(product.getId()).thenReturn("product-id");
        when(variant.getRamGb()).thenReturn(8);
        when(variant.getStorageGb()).thenReturn(256);
        when(variant.getColor()).thenReturn("Silver");

        ProductVariant unit1 = mock(ProductVariant.class);
        when(productVariantRepository.findAvailablePhysicalUnits("product-id", 8, 256, "Silver"))
                .thenReturn(List.of(unit1));

        when(exportLogRepository.save(any(ExportLog.class))).thenAnswer(inv -> {
            ExportLog el = inv.getArgument(0);
            el.setId("export-log-id");
            return el;
        });

        // Mock Receipt save
        Receipt receipt = mock(Receipt.class);
        when(receipt.getId()).thenReturn("receipt-id");
        when(receiptRepository.save(any(Receipt.class))).thenReturn(receipt);

        // Mock Mapper to expect warning message
        when(exportLogMapper.toExportLogResponseDto(any(ExportLog.class), eq("receipt-id"), eq("Inventory was updated, but notification status could not be displayed")))
                .thenReturn(ExportLogResponseDto.builder()
                        .id("export-log-id")
                        .performedById("performer-id")
                        .receiptId("receipt-id")
                        .status(ImportAndExportStatus.SUCCESS)
                        .message("Inventory was updated, but notification status could not be displayed")
                        .build());

        ExportLogResponseDto response = exportLogService.exportProducts(requestDto);

        assertNotNull(response);
        assertEquals("export-log-id", response.getId());
        assertEquals("receipt-id", response.getReceiptId());
        assertEquals("Inventory was updated, but notification status could not be displayed", response.getMessage());

        verify(receiptRepository).save(any(Receipt.class));
        verify(notificationRepository, never()).save(any(Notification.class));
    }
}
