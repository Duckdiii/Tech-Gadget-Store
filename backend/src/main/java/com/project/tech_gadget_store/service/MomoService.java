package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.dto.request.MomoIpnCallbackDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MomoService {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private final MomoProperties props;
    private final RestClient restClient;

    public MomoService(MomoProperties props) {
        this.props = props;
        this.restClient = RestClient.create();
    }

    /**
     * Gọi MoMo sandbox để tạo payment, trả về payUrl để FE redirect.
     */
    public String createPayment(String orderId, BigDecimal amount, String orderInfo) {
        String requestId = UUID.randomUUID().toString();
        String extraData = "";
        String resolvedOrderInfo = (orderInfo != null && !orderInfo.isBlank())
                ? orderInfo : "Thanh toan don hang " + orderId;
        long amountLong = amount.longValue();

        String rawSignature = buildCreateSignatureData(
                requestId, amountLong, extraData, orderId, resolvedOrderInfo);
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
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Không thể kết nối tới MoMo sandbox: " + e.getMessage());
        }

        if (response == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "MoMo không trả về phản hồi");
        }

        Object resultCodeObj = response.get("resultCode");
        int resultCode = resultCodeObj instanceof Number n ? n.intValue() : -1;
        if (resultCode != 0) {
            String msg = (String) response.getOrDefault("message", "Lỗi không xác định từ MoMo");
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "MoMo: " + msg);
        }

        String payUrl = (String) response.get("payUrl");
        if (payUrl == null || payUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "MoMo không trả về payUrl");
        }
        return payUrl;
    }

    /**
     * Xác minh chữ ký HMAC-SHA256 từ IPN callback của MoMo.
     * Raw signature cho IPN khác với signature khi tạo payment.
     */
    public boolean verifyIpnSignature(MomoIpnCallbackDto ipn) {
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

    // ---------- helpers ----------

    private String buildCreateSignatureData(String requestId, long amount, String extraData,
                                            String orderId, String orderInfo) {
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
