package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.entity.OrderItem;
import com.project.tech_gadget_store.repository.OrderItemRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.service.InvoiceService;
import com.project.tech_gadget_store.dto.response.InvoiceOrderData;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.List;

import org.springframework.stereotype.Service;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TemplateEngine templateEngine; // Của Thymeleaf

    @Override
    public Mono<byte[]> generatePdfInvoice(UUID orderId, UUID accountId, String role) {

        // 1. Lấy dữ liệu (Chỗ này bạn tự nối flatMap để lấy order và items nhé)
        return getOrderAndItems(orderId, accountId, role)
                .flatMap(orderData -> {

                    // 2. Tác vụ nặng: Chuyển HTML -> PDF (Phải bọc trong Mono.fromCallable)
                    return Mono.fromCallable(() -> {

                        // Tạo bối cảnh dữ liệu cho HTML
                        Context context = new Context();
                        context.setVariable("orderCode", orderData.orderCode());
                        context.setVariable("customerName", orderData.receiverName());
                        context.setVariable("date",
                            orderData.createdAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                        context.setVariable("items", orderData.items());
                        context.setVariable("totalAmount", orderData.totalAmount());

                        // Thymeleaf render file "invoice_template.html" thành chuỗi String
                        String htmlContent = templateEngine.process("invoice_template", context);

                        // OpenHTMLToPDF nén thành byte[]
                        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                        PdfRendererBuilder builder = new PdfRendererBuilder();
                        builder.useFastMode();
                        builder.withHtmlContent(htmlContent, null);
                        builder.toStream(outputStream);
                        builder.run();

                        return outputStream.toByteArray();
                    })
                            .subscribeOn(Schedulers.boundedElastic()); // BẮT BUỘC CÓ DÒNG NÀY
                });
    }

    private Mono<InvoiceOrderData> getOrderAndItems(UUID orderId, UUID accountId, String role) {
        return orderRepository.findByIdAndAccountId(orderId, accountId)
                .flatMap(order -> orderItemRepository.findAllByOrderId(order.getId())
                        .collectList()
                        .map(items -> new InvoiceOrderData(
                                order.getOrderCode(),
                                order.getShippingAddressSnapshot(),
                                order.getCreatedAt(),
                                order.getTotalAmount(),
                                items)));
    }

}
