package com.project.tech_gadget_store.modules.payment.service;

import com.project.tech_gadget_store.common.exception.PaymentGatewayException;
import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.config.PaymentProperties;
import com.project.tech_gadget_store.modules.payment.dto.request.MomoIpnCallbackDto;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;



@Service
public class MomoService {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private final MomoProperties momoProperties;
    private final PaymentProperties paymentProperties;
    private final RestClient restClient;

    public MomoService(MomoProperties momoProperties, PaymentProperties paymentProperties) {
        this.momoProperties = momoProperties;
        this.paymentProperties = paymentProperties;
        this.restClient = RestClient.create();
    }

    /** Cấu hình MoMo đang active — Sandbox hoặc Production tuỳ theo app.payment.default-sandbox-mode
     * và app.payment.momo.production.enabled (xem {@link MomoProperties#active}). */
    private MomoProperties.Gateway gateway() {
        return momoProperties.active(paymentProperties.isDefaultSandboxMode());
    }

    /**
     * Gọi MoMo (Sandbox hoặc Production tuỳ cấu hình hiện tại) để tạo payment, trả về payUrl để FE redirect.
     */
    public String createPayment(String orderId, BigDecimal amount, String orderInfo) {
        MomoProperties.Gateway props = gateway();
        String requestId = UUID.randomUUID().toString();
        String extraData = "";
        String resolvedOrderInfo = (orderInfo != null && !orderInfo.isBlank())
                ? orderInfo : "Thanh toan don hang " + orderId;
        long amountLong = amount.longValue();

        String rawSignature = buildCreateSignatureData(
                props, requestId, amountLong, extraData, orderId, resolvedOrderInfo);
        String signature = hmacSHA256(props.getSecretKey(), rawSignature);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", props.getPartnerCode());
        body.put("requestId", requestId);
        body.put("amount", amountLong);
        body.put("orderId", orderId);
        body.put("orderInfo", resolvedOrderInfo);
        body.put("redirectUrl", props.getRedirectUrl());
        body.put("ipnUrl", props.getIpnUrl());
        body.put("requestType", props.getRequestType());
        body.put("extraData", extraData);
        body.put("lang", props.getLang());
        body.put("signature", signature);

        Map<String, Object> response;
        try {
            response = restClient.post()
                    .uri(props.getEndpoint())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (Exception e) {
            throw new PaymentGatewayException("Không thể kết nối tới MoMo: " + e.getMessage());
        }

        if (response == null) {
            throw new PaymentGatewayException("MoMo không trả về phản hồi");
        }

        Object resultCodeObj = response.get("resultCode");
        int resultCode = resultCodeObj instanceof Number n ? n.intValue() : -1;
        if (resultCode != 0) {
            String msg = (String) response.getOrDefault("message", "Lỗi không xác định từ MoMo");
            throw new PaymentGatewayException("MoMo: " + msg);
        }

        String payUrl = (String) response.get("payUrl");
        if (payUrl == null || payUrl.isBlank()) {
            throw new PaymentGatewayException("MoMo không trả về payUrl");
        }
        return payUrl;
    }

    /**
     * Xác minh chữ ký HMAC-SHA256 từ IPN callback của MoMo.
     * Raw signature cho IPN khác với signature khi tạo payment.
     */
    public boolean verifyIpnSignature(MomoIpnCallbackDto ipn) {
        MomoProperties.Gateway props = gateway();
        String rawSignature = "accessKey=" + props.getAccessKey()
                + "&amount=" + ipn.getAmount()
                + "&extraData=" + nullSafe(ipn.getExtraData())
                + "&message=" + nullSafe(ipn.getMessage())
                + "&orderId=" + nullSafe(ipn.getOrderId())
                + "&orderInfo=" + nullSafe(ipn.getOrderInfo())
                + "&orderType=" + nullSafe(ipn.getOrderType())
                + "&partnerCode=" + nullSafe(ipn.getPartnerCode())
                + "&payType=" + nullSafe(ipn.getPayType())
                + "&requestId=" + nullSafe(ipn.getRequestId())
                + "&responseTime=" + ipn.getResponseTime()
                + "&resultCode=" + ipn.getResultCode()
                + "&transId=" + ipn.getTransId();

        String expected = hmacSHA256(props.getSecretKey(), rawSignature);
        return expected.equals(ipn.getSignature());
    }

    /**
     * Xác minh chữ ký HMAC-SHA256 từ redirect return URL của MoMo (GET, trình duyệt user).
     * MoMo dùng cùng bộ field và cùng thuật toán ký cho cả ipnUrl (server-to-server) lẫn
     * redirectUrl (browser return) — xem {@link #verifyIpnSignature}. Không verify được raw
     * signature này đồng nghĩa request có thể bị giả mạo để đánh dấu đơn hàng đã thanh toán.
     */
    public boolean verifyReturnSignature(Map<String, String> params) {
        String receivedSignature = params.get("signature");
        if (receivedSignature == null || receivedSignature.isBlank()) {
            return false;
        }

        MomoProperties.Gateway props = gateway();
        String rawSignature = "accessKey=" + props.getAccessKey()
                + "&amount=" + nullSafe(params.get("amount"))
                + "&extraData=" + nullSafe(params.get("extraData"))
                + "&message=" + nullSafe(params.get("message"))
                + "&orderId=" + nullSafe(params.get("orderId"))
                + "&orderInfo=" + nullSafe(params.get("orderInfo"))
                + "&orderType=" + nullSafe(params.get("orderType"))
                + "&partnerCode=" + nullSafe(params.get("partnerCode"))
                + "&payType=" + nullSafe(params.get("payType"))
                + "&requestId=" + nullSafe(params.get("requestId"))
                + "&responseTime=" + nullSafe(params.get("responseTime"))
                + "&resultCode=" + nullSafe(params.get("resultCode"))
                + "&transId=" + nullSafe(params.get("transId"));

        String expected = hmacSHA256(props.getSecretKey(), rawSignature);
        return expected.equals(receivedSignature);
    }

    // ---------- helpers ----------

    private String buildCreateSignatureData(MomoProperties.Gateway props, String requestId, long amount,
                                            String extraData, String orderId, String orderInfo) {
        // Thứ tự fields phải đúng theo tài liệu MoMo v2
        return "accessKey=" + props.getAccessKey()
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + props.getIpnUrl()
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + props.getPartnerCode()
                + "&redirectUrl=" + props.getRedirectUrl()
                + "&requestId=" + requestId
                + "&requestType=" + props.getRequestType();
    }

    private String hmacSHA256(String secretKey, String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Không thể tạo HMAC-SHA256", e);
        }
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
