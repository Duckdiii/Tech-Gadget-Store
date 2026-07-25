package com.project.tech_gadget_store.modules.payment.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.project.tech_gadget_store.config.MomoProperties;
import com.project.tech_gadget_store.config.PaymentProperties;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MomoServiceTest {

    private MomoService momoService;
    private MomoProperties.Gateway props;

    @BeforeEach
    void setUp() {
        MomoProperties momoProperties = new MomoProperties();
        props = momoProperties.getSandbox();
        props.setPartnerCode("MOMO_PARTNER");
        props.setAccessKey("ACCESS_KEY");
        props.setSecretKey("SECRET_KEY");
        momoService = new MomoService(momoProperties, new PaymentProperties());
    }

    /** Builds a return-URL param set whose "signature" is genuinely computed by MoMo's algorithm. */
    private Map<String, String> validReturnParams() {
        Map<String, String> params = new HashMap<>();
        params.put("partnerCode", "MOMO_PARTNER");
        params.put("orderId", "order-123");
        params.put("requestId", "req-1");
        params.put("amount", "199000");
        params.put("orderInfo", "Thanh toan don hang order-123");
        params.put("orderType", "momo_wallet");
        params.put("transId", "999888777");
        params.put("resultCode", "0");
        params.put("message", "Success");
        params.put("payType", "qr");
        params.put("responseTime", "1234567890");
        params.put("extraData", "");
        params.put("signature", computeSignature(params));
        return params;
    }

    private String computeSignature(Map<String, String> params) {
        String rawSignature = "accessKey=" + props.getAccessKey()
                + "&amount=" + params.get("amount")
                + "&extraData=" + params.get("extraData")
                + "&message=" + params.get("message")
                + "&orderId=" + params.get("orderId")
                + "&orderInfo=" + params.get("orderInfo")
                + "&orderType=" + params.get("orderType")
                + "&partnerCode=" + params.get("partnerCode")
                + "&payType=" + params.get("payType")
                + "&requestId=" + params.get("requestId")
                + "&responseTime=" + params.get("responseTime")
                + "&resultCode=" + params.get("resultCode")
                + "&transId=" + params.get("transId");
        return hmacSHA256(props.getSecretKey(), rawSignature);
    }

    private String hmacSHA256(String secretKey, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException(e);
        }
    }

    @Test
    void verifyReturnSignature_genuineSignature_returnsTrue() {
        assertThat(momoService.verifyReturnSignature(validReturnParams())).isTrue();
    }

    @Test
    void verifyReturnSignature_tamperedResultCode_returnsFalse() {
        Map<String, String> params = validReturnParams();
        params.put("resultCode", "9");

        assertThat(momoService.verifyReturnSignature(params)).isFalse();
    }

    @Test
    void verifyReturnSignature_tamperedOrderId_returnsFalse() {
        Map<String, String> params = validReturnParams();
        params.put("orderId", "someone-elses-order");

        assertThat(momoService.verifyReturnSignature(params)).isFalse();
    }

    @Test
    void verifyReturnSignature_missingSignature_returnsFalse() {
        Map<String, String> params = validReturnParams();
        params.remove("signature");

        assertThat(momoService.verifyReturnSignature(params)).isFalse();
    }

    @Test
    void verifyReturnSignature_forgedRequestWithNoSignatureAtAll_returnsFalse() {
        Map<String, String> forgedParams = new HashMap<>();
        forgedParams.put("orderId", "pending-log-id");
        forgedParams.put("resultCode", "0");
        forgedParams.put("transId", "123");

        assertThat(momoService.verifyReturnSignature(forgedParams)).isFalse();
    }
}
