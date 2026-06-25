package com.project.tech_gadget_store.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.project.tech_gadget_store.dto.response.InvoiceItemResponseDto;
import com.project.tech_gadget_store.dto.response.InvoiceResponseDto;
import com.project.tech_gadget_store.entity.BundleService;
import com.project.tech_gadget_store.entity.Invoice;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.OrderItem;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.mapper.InvoiceMapper;
import com.project.tech_gadget_store.repository.InvoiceRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final InvoiceMapper invoiceMapper;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          OrderRepository orderRepository,
                          InvoiceMapper invoiceMapper) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
        this.invoiceMapper = invoiceMapper;
    }

    @Transactional
    public InvoiceResponseDto getOrCreateInvoice(String orderId, String customerEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại: " + orderId));

        // Security check: Only the customer who placed the order can view the invoice
        if (order.getCustomer() == null || order.getCustomer().getAccount() == null ||
                !order.getCustomer().getAccount().getEmail().equals(customerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem hoá đơn này");
        }

        // Validate order status
        if (OrderStatus.CANCELLED.equals(order.getOrderStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xuất hoá đơn cho đơn hàng đã huỷ");
        }

        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    BigDecimal originalAmount = order.calculateSubtotal();
                    BigDecimal discountAmount = BigDecimal.ZERO;
                    
                    if (order.getCustomer() != null && order.getCustomer().getMembership() != null &&
                            order.getCustomer().getMembership().getBenefit() != null) {
                        discountAmount = order.getCustomer().getMembership().getBenefit()
                                .calculateDiscount(originalAmount)
                                .setScale(2, RoundingMode.HALF_UP);
                    }

                    BigDecimal beforeVat = originalAmount.subtract(discountAmount);
                    BigDecimal vatAmount = beforeVat.multiply(new BigDecimal("0.1"))
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal finalAmount = beforeVat.add(vatAmount);

                    Invoice newInvoice = new Invoice(order, originalAmount, vatAmount, discountAmount, finalAmount);
                    return invoiceRepository.save(newInvoice);
                });

        return invoiceMapper.toInvoiceResponseDto(invoice);
    }

    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(String orderId, String customerEmail) {
        // Retrieve or create first to perform security checks and compute amounts
        InvoiceResponseDto dto = getOrCreateInvoice(orderId, customerEmail);
        
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hoá đơn"));

        try {
            String htmlContent = buildXhtmlContent(invoice, dto);
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            
            // Optional system font registration for proper Vietnamese characters
            File arialFont = new File("C:\\Windows\\Fonts\\arial.ttf");
            if (arialFont.exists()) {
                builder.useFont(arialFont, "Arial");
            }
            
            builder.withHtmlContent(htmlContent, "/");
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi tạo file PDF hoá đơn: " + e.getMessage(), e);
        }
    }

    private String buildXhtmlContent(Invoice invoice, InvoiceResponseDto dto) {
        StringBuilder html = new StringBuilder();
        html.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        html.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n");
        html.append("<html xmlns=\"http://www.w3.org/1999/xhtml\">\n");
        html.append("<head>\n");
        html.append("<title>Hoa Don Ban Hang</title>\n");
        html.append("<style type=\"text/css\">\n");
        html.append("  body { font-family: 'Arial', sans-serif; color: #333333; margin: 30px; line-height: 1.4; }\n");
        html.append("  .header-table { width: 100%; border: none; margin-bottom: 30px; }\n");
        html.append("  .company-title { font-size: 24px; font-weight: bold; color: #1d4ed8; }\n");
        html.append("  .company-details { font-size: 12px; color: #6b7280; margin-top: 5px; }\n");
        html.append("  .invoice-title { font-size: 20px; font-weight: bold; text-align: right; color: #111827; letter-spacing: 1px; }\n");
        html.append("  .invoice-meta { font-size: 13px; text-align: right; color: #374151; margin-top: 10px; }\n");
        html.append("  .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }\n");
        html.append("  .info-table { width: 100%; margin-bottom: 25px; border-spacing: 15px; margin-left: -15px; }\n");
        html.append("  .info-card { background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 15px; vertical-align: top; width: 50%; }\n");
        html.append("  .info-title { font-size: 11px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }\n");
        html.append("  .info-text { font-size: 13px; color: #1f2937; }\n");
        html.append("  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }\n");
        html.append("  .items-table th { border-bottom: 2px solid #e5e7eb; padding: 10px; text-align: left; font-size: 11px; font-weight: bold; color: #4b5563; text-transform: uppercase; }\n");
        html.append("  .items-table td { padding: 12px 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; vertical-align: top; }\n");
        html.append("  .item-name { font-weight: bold; color: #111827; }\n");
        html.append("  .item-variant { font-size: 11px; color: #6b7280; margin-top: 2px; }\n");
        html.append("  .bundle-service { font-size: 11px; color: #2563eb; margin-top: 2px; }\n");
        html.append("  .totals-wrapper { width: 100%; margin-top: 10px; }\n");
        html.append("  .totals-table { width: 280px; margin-left: auto; border-collapse: collapse; font-size: 13px; }\n");
        html.append("  .totals-table td { padding: 5px 0; }\n");
        html.append("  .totals-label { color: #6b7280; text-align: left; }\n");
        html.append("  .totals-value { text-align: right; font-weight: bold; color: #374151; }\n");
        html.append("  .grand-total-label { font-weight: bold; font-size: 14px; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 10px; }\n");
        html.append("  .grand-total-value { font-weight: bold; font-size: 18px; color: #1d4ed8; text-align: right; border-top: 2px solid #e5e7eb; padding-top: 10px; }\n");
        html.append("  .footer { margin-top: 60px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; }\n");
        html.append("</style>\n");
        html.append("</head>\n");
        html.append("<body>\n");

        // Header Table
        html.append("  <table class=\"header-table\">\n");
        html.append("    <tr>\n");
        html.append("      <td style=\"vertical-align: top;\">\n");
        html.append("        <span class=\"company-title\">TechStore</span>\n");
        html.append("        <div class=\"company-details\">\n");
        html.append("          <p>123 Nguyen Van Linh, Quan 7, TP. HCM</p>\n");
        html.append("          <p>MST: 0123456789</p>\n");
        html.append("          <p>Hotline: 1800 1234</p>\n");
        html.append("        </div>\n");
        html.append("      </td>\n");
        html.append("      <td style=\"vertical-align: top; text-align: right;\">\n");
        html.append("        <span class=\"invoice-title\">HOA DON BAN HANG</span>\n");
        html.append("        <div class=\"invoice-meta\">\n");
        html.append("          <p><strong>Ma hoa don:</strong> ").append(dto.getId()).append("</p>\n");
        html.append("          <p><strong>Ma don hang:</strong> ").append(dto.getOrderId()).append("</p>\n");
        html.append("          <p><strong>Ngay lap:</strong> ").append(formatDate(dto.getIssuedAt())).append("</p>\n");
        html.append("        </div>\n");
        html.append("      </td>\n");
        html.append("    </tr>\n");
        html.append("  </table>\n");

        html.append("  <div class=\"divider\"></div>\n");

        // Info Cards (Customer info & Shipping info)
        html.append("  <table class=\"info-table\">\n");
        html.append("    <tr>\n");
        html.append("      <td class=\"info-card\">\n");
        html.append("        <div class=\"info-title\">Thong tin khach hang</div>\n");
        if (invoice.getOrder() != null) {
            String name = invoice.getOrder().getCustomer() != null ? invoice.getOrder().getCustomer().getFullName() : "";
            String phone = invoice.getOrder().getCustomer() != null ? invoice.getOrder().getCustomer().getPhone() : "";
            html.append("        <div class=\"info-text\">\n");
            html.append("          <p><strong>Khach hang:</strong> ").append(escapeHtml(name)).append("</p>\n");
            html.append("          <p><strong>Dien thoai:</strong> ").append(escapeHtml(phone)).append("</p>\n");
            html.append("          <p><strong>Thanh toan:</strong> ").append(escapeHtml(dto.getPaymentMethod())).append("</p>\n");
            html.append("        </div>\n");
        }
        html.append("      </td>\n");
        html.append("      <td class=\"info-card\">\n");
        html.append("        <div class=\"info-title\">Dia chi giao hang</div>\n");
        if (invoice.getOrder() != null && invoice.getOrder().getAddress() != null) {
            var addr = invoice.getOrder().getAddress();
            html.append("        <div class=\"info-text\">\n");
            html.append("          <p>").append(escapeHtml(addr.getStreet())).append("</p>\n");
            html.append("          <p>").append(escapeHtml(addr.getWard())).append(", ").append(escapeHtml(addr.getDistrict())).append("</p>\n");
            html.append("          <p>").append(escapeHtml(addr.getProvince())).append("</p>\n");
            html.append("        </div>\n");
        }
        html.append("      </td>\n");
        html.append("    </tr>\n");
        html.append("  </table>\n");

        // Items Table
        html.append("  <table class=\"items-table\">\n");
        html.append("    <thead>\n");
        html.append("      <tr>\n");
        html.append("        <th style=\"width: 5%;\">#</th>\n");
        html.append("        <th style=\"width: 55%;\">San pham</th>\n");
        html.append("        <th style=\"width: 10%; text-align: center;\">SL</th>\n");
        html.append("        <th style=\"width: 15%; text-align: right;\">Don gia</th>\n");
        html.append("        <th style=\"width: 15%; text-align: right;\">Thanh tien</th>\n");
        html.append("      </tr>\n");
        html.append("    </thead>\n");
        html.append("    <tbody>\n");

        if (dto.getItems() != null) {
            int index = 1;
            for (InvoiceItemResponseDto item : dto.getItems()) {
                html.append("      <tr>\n");
                html.append("        <td>").append(String.format("%02d", index++)).append("</td>\n");
                html.append("        <td>\n");
                html.append("          <span class=\"item-name\">").append(escapeHtml(item.getProductName())).append("</span>\n");
                if (item.getVariantName() != null) {
                    html.append("          <div class=\"item-variant\">").append(escapeHtml(item.getVariantName())).append("</div>\n");
                }
                if (item.getBundleServices() != null) {
                    for (String bundle : item.getBundleServices()) {
                        html.append("          <div class=\"bundle-service\">+ ").append(escapeHtml(bundle)).append("</div>\n");
                    }
                }
                html.append("        </td>\n");
                html.append("        <td style=\"text-align: center;\">").append(item.getQuantity()).append("</td>\n");
                html.append("        <td style=\"text-align: right;\">").append(formatCurrency(item.getUnitPrice())).append("</td>\n");
                html.append("        <td style=\"text-align: right;\">").append(formatCurrency(item.getTotalPrice())).append("</td>\n");
                html.append("      </tr>\n");
            }
        }

        html.append("    </tbody>\n");
        html.append("  </table>\n");

        // Totals
        html.append("  <div class=\"totals-wrapper\">\n");
        html.append("    <table class=\"totals-table\">\n");
        html.append("      <tr>\n");
        html.append("        <td class=\"totals-label\">Tam tinh</td>\n");
        html.append("        <td class=\"totals-value\">").append(formatCurrency(dto.getOriginalAmount())).append("</td>\n");
        html.append("      </tr>\n");
        if (dto.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            html.append("      <tr>\n");
            html.append("        <td class=\"totals-label\" style=\"color: #16a34a;\">Giam gia thanh vien</td>\n");
            html.append("        <td class=\"totals-value\" style=\"color: #16a34a;\">- ").append(formatCurrency(dto.getDiscountAmount())).append("</td>\n");
            html.append("      </tr>\n");
        }
        html.append("      <tr>\n");
        html.append("        <td class=\"totals-label\">Thue VAT (10%)</td>\n");
        html.append("        <td class=\"totals-value\">+ ").append(formatCurrency(dto.getVatAmount())).append("</td>\n");
        html.append("      </tr>\n");
        html.append("      <tr>\n");
        html.append("        <td class=\"grand-total-label\">Tong cong</td>\n");
        html.append("        <td class=\"grand-total-value\">").append(formatCurrency(dto.getFinalAmount())).append("</td>\n");
        html.append("      </tr>\n");
        html.append("    </table>\n");
        html.append("  </div>\n");

        // Footer
        html.append("  <div class=\"footer\">\n");
        html.append("    <p>Cam on ban da mua sam tai TechStore!</p>\n");
        html.append("    <p>support@techstore.vn · Hotline: 1800 1234</p>\n");
        html.append("  </div>\n");

        html.append("</body>\n");
        html.append("</html>\n");

        return html.toString();
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0 đ";
        NumberFormat nf = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " đ";
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return dateTime.format(formatter);
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
