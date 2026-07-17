package com.project.tech_gadget_store.modules.payment.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.project.tech_gadget_store.config.VNPayProperties;
import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class VNPayServiceTest {

    private VNPayService vnPayService;

    @BeforeEach
    void setUp() {
        VNPayProperties props = new VNPayProperties();
        props.setPaymentUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        props.setTmnCode("TESTCODE");
        props.setHashSecret("SOME_SECRET_KEY");
        props.setReturnUrl("http://localhost:8080/api/payments/vnpay/return");
        vnPayService = new VNPayService(props);
    }

    /**
     * buildPaymentUrl signs on URL-encoded key=value pairs; a real HTTP round trip decodes the
     * query string before verifyReturnHash sees it (see PaymentController#handleVNPayReturn's
     * {@code @RequestParam Map<String, String>}). Simulate that decode step here so the hash and
     * the query stay provably in sync — this is exactly the mismatch that caused VNPay's "Sai
     * chữ ký" (invalid signature) error before the fix.
     */
    @Test
    void buildPaymentUrl_thenSimulatedReturnRoundTrip_verifiesSuccessfully() {
        String redirectUrl = vnPayService.buildPaymentUrl(
                "order-123", new BigDecimal("199000.50"), "127.0.0.1", "Thanh toán đơn hàng có dấu & khoảng trắng");

        String queryString = redirectUrl.substring(redirectUrl.indexOf('?') + 1);
        Map<String, String> decodedParams = new HashMap<>();
        for (String pair : queryString.split("&")) {
            int eq = pair.indexOf('=');
            String key = URLDecoder.decode(pair.substring(0, eq), StandardCharsets.UTF_8);
            String value = URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8);
            decodedParams.put(key, value);
        }

        assertThat(vnPayService.verifyReturnHash(decodedParams)).isTrue();
    }

    @Test
    void verifyReturnHash_tamperedAmount_fails() {
        String redirectUrl = vnPayService.buildPaymentUrl("order-123", new BigDecimal("199000"), "127.0.0.1", null);
        String queryString = redirectUrl.substring(redirectUrl.indexOf('?') + 1);
        Map<String, String> decodedParams = new HashMap<>();
        for (String pair : queryString.split("&")) {
            int eq = pair.indexOf('=');
            String key = URLDecoder.decode(pair.substring(0, eq), StandardCharsets.UTF_8);
            String value = URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8);
            decodedParams.put(key, value);
        }

        decodedParams.put("vnp_Amount", "1");

        assertThat(vnPayService.verifyReturnHash(decodedParams)).isFalse();
    }

    @Test
    void buildPaymentUrl_amountConvertedToVndTimes100WithoutDecimals() {
        String redirectUrl = vnPayService.buildPaymentUrl("order-1", new BigDecimal("22990000.00"), null, null);
        String decodedQuery = URLDecoder.decode(redirectUrl, StandardCharsets.UTF_8);

        assertThat(decodedQuery).contains("vnp_Amount=2299000000");
    }
}
