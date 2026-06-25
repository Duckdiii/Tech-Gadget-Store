package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.response.InvoiceResponseDto;
import com.project.tech_gadget_store.service.InvoiceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InvoiceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private InvoiceController invoiceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(invoiceController).build();
    }

    @Test
    void getOrCreateInvoice_Success() throws Exception {
        InvoiceResponseDto responseDto = InvoiceResponseDto.builder()
                .id("invoice-123")
                .orderId("order-123")
                .build();

        // Stubbing
        when(invoiceService.getOrCreateInvoice(eq("order-123"), any())).thenReturn(responseDto);

        mockMvc.perform(get("/api/customer/invoices/order/order-123")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("invoice-123"))
                .andExpect(jsonPath("$.orderId").value("order-123"));
    }

    @Test
    void downloadInvoicePdf_Success() throws Exception {
        byte[] pdfBytes = "PDF content".getBytes();

        when(invoiceService.generateInvoicePdf(eq("order-123"), any())).thenReturn(pdfBytes);

        mockMvc.perform(get("/api/customer/invoices/order/order-123/pdf")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", "form-data; name=\"attachment\"; filename=\"invoice_order-123.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }
}

