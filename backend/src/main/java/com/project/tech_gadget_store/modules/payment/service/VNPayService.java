package com.project.tech_gadget_store.modules.payment.service;

import com.project.tech_gadget_store.config.PaymentProperties;
import com.project.tech_gadget_store.config.VNPayProperties;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;



@Service
public class VNPayService {

    private static final String HMAC_SHA512 = "HmacSHA512";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VNPayProperties vnpayProperties;
    private final PaymentProperties paymentProperties;

    public VNPayService(VNPayProperties vnpayProperties, PaymentProperties paymentProperties) {
        this.vnpayProperties = vnpayProperties;
        this.paymentProperties = paymentProperties;
    }

    /** Cấu hình VNPay đang active — Sandbox hoặc Production tuỳ theo app.payment.default-sandbox-mode
     * và app.payment.vnpay.production.enabled (xem {@link VNPayProperties#active}). */
    private VNPayProperties.Gateway gateway() {
        return vnpayProperties.active(paymentProperties.isDefaultSandboxMode());
    }

    /**
     * Xây dựng URL thanh toán VNPay có chữ ký HmacSHA512.
     * VNPay yêu cầu amount = VND × 100 (không có phần thập phân).
     */
    public String buildPaymentUrl(String orderId, BigDecimal amount, String clientIp, String orderInfo) {
        VNPayProperties.Gateway props = gateway();
        String createDate = LocalDateTime.now().format(DATE_FORMATTER);
        String resolvedOrderInfo = (orderInfo != null && !orderInfo.isBlank())
                ? orderInfo : "Thanh toan don hang " + orderId;

        // TreeMap tự động sắp xếp key theo alphabet — bắt buộc cho VNPay
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", props.getVersion());
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", props.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount.multiply(BigDecimal.valueOf(100)).longValue()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", resolvedOrderInfo);
        params.put("vnp_OrderType", props.getOrderType());
        params.put("vnp_Locale", props.getLocale());
        params.put("vnp_ReturnUrl", props.getReturnUrl());
        params.put("vnp_IpAddr", clientIp != null ? clientIp : "127.0.0.1");
        params.put("vnp_CreateDate", createDate);

        // VNPay ký (và tự kiểm tra lại) trên chuỗi ĐÃ URL-encode từng key=value, không phải giá trị thô
        // — dùng giá trị thô để tính hash trong khi URL lại chứa giá trị đã encode sẽ khiến hai bên
        // tính ra chữ ký khác nhau, VNPay trả về lỗi "Sai chữ ký". Nên hash và query phải giống hệt nhau.
        String query = params.entrySet().stream()
                .map(e -> urlEncode(e.getKey()) + "=" + urlEncode(e.getValue()))
                .collect(Collectors.joining("&"));

        String secureHash = hmacSHA512(props.getHashSecret(), query);

        return props.getPaymentUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    /**
     * Xác minh chữ ký VNPay từ return URL hoặc IPN.
     * Spring MVC đã URL-decode các query params trước khi binding, nhưng VNPay tính chữ ký trên
     * giá trị ĐÃ encode (xem {@link #buildPaymentUrl}) — nên phải encode lại trước khi so khớp.
     */
    public boolean verifyReturnHash(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }

        VNPayProperties.Gateway props = gateway();
        Map<String, String> paramsForHash = new TreeMap<>(params);
        paramsForHash.remove("vnp_SecureHash");
        paramsForHash.remove("vnp_SecureHashType");

        String hashData = paramsForHash.entrySet().stream()
                .map(e -> urlEncode(e.getKey()) + "=" + urlEncode(e.getValue()))
                .collect(Collectors.joining("&"));

        String expectedHash = hmacSHA512(props.getHashSecret(), hashData);
        return expectedHash.equalsIgnoreCase(receivedHash);
    }

    // ---------- helpers ----------

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA512);
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA512));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Không thể tạo HMAC-SHA512", e);
        }
    }

    /** VNPay dùng '+' cho khoảng trắng (giống chuẩn application/x-www-form-urlencoded của URLEncoder). */
    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
