package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.MomoIpnCallbackDto;
import com.project.tech_gadget_store.dto.request.PaymentCreateRequestDto;
import com.project.tech_gadget_store.dto.response.MomoPaymentResponseDto;
import com.project.tech_gadget_store.dto.response.PaymentVerifyResponseDto;
import com.project.tech_gadget_store.dto.response.VNPayPaymentResponseDto;
import com.project.tech_gadget_store.service.MomoService;
import com.project.tech_gadget_store.service.PaymentService;
import com.project.tech_gadget_store.service.VNPayService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final MomoService momoService;
    private final VNPayService vnpayService;
    private final PaymentService paymentService;

    public PaymentController(MomoService momoService,
                             VNPayService vnpayService,
                             PaymentService paymentService) {
        this.momoService = momoService;
        this.vnpayService = vnpayService;
        this.paymentService = paymentService;
    }

    /**
     * Tạo payment request gửi lên MoMo sandbox.
     * Trả về payUrl để FE redirect window.location.href.
     */
    @PostMapping("/momo/create")
    public ResponseEntity<MomoPaymentResponseDto> createMomoPayment(
            @Valid @RequestBody PaymentCreateRequestDto req) {
        paymentService.createPendingLog(req.getOrderId(), req.getAmount(), true);
        String payUrl = momoService.createPayment(req.getOrderId(), req.getAmount(), req.getOrderInfo());

        return ResponseEntity.ok(MomoPaymentResponseDto.builder()
                .payUrl(payUrl)
                .orderId(req.getOrderId())
                .message("Tạo thanh toán MoMo thành công")
                .build());
    }

    /**
     * Nhận IPN server-to-server từ MoMo sau khi user thanh toán.
     * Endpoint này phải public (không cần JWT) và phải trả về 200 OK cho MoMo.
     * MoMo sẽ retry nếu không nhận được 200 trong vòng 30 giây.
     */
    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, Object>> handleMomoIpn(
            @RequestBody MomoIpnCallbackDto ipn) {
        if (!momoService.verifyIpnSignature(ipn)) {
            return ResponseEntity.ok(Map.of("resultCode", 1, "message", "Signature invalid"));
        }

        if (Integer.valueOf(0).equals(ipn.getResultCode())) {
            paymentService.markSuccess(ipn.getOrderId(), String.valueOf(ipn.getTransId()));
        } else {
            paymentService.markFailed(ipn.getOrderId(),
                    "MoMo resultCode=" + ipn.getResultCode() + ": " + ipn.getMessage());
        }

        // MoMo bắt buộc nhận về body với resultCode=0 để xác nhận đã xử lý
        return ResponseEntity.ok(Map.of("resultCode", 0, "message", "Confirmed"));
    }

    /**
     * Tạo URL thanh toán VNPay có chữ ký HmacSHA512.
     * Trả về paymentUrl để FE redirect window.location.href.
     */
    @PostMapping("/vnpay/create")
    public ResponseEntity<VNPayPaymentResponseDto> createVNPayPayment(
            @Valid @RequestBody PaymentCreateRequestDto req) {
        paymentService.createPendingLog(req.getOrderId(), req.getAmount(), false);
        String paymentUrl = vnpayService.buildPaymentUrl(
                req.getOrderId(), req.getAmount(), req.getClientIp(), req.getOrderInfo());

        return ResponseEntity.ok(VNPayPaymentResponseDto.builder()
                .paymentUrl(paymentUrl)
                .orderId(req.getOrderId())
                .build());
    }

    /**
     * Nhận redirect từ VNPay sau khi user thanh toán (trình duyệt user được redirect về đây).
     * FE gọi endpoint này với toàn bộ query params từ VNPay, backend verify rồi trả JSON.
     * Endpoint này phải public (không cần JWT).
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<PaymentVerifyResponseDto> handleVNPayReturn(
            @RequestParam Map<String, String> params) {
        if (!vnpayService.verifyReturnHash(params)) {
            return ResponseEntity.ok(PaymentVerifyResponseDto.builder()
                    .success(false)
                    .message("Chữ ký không hợp lệ")
                    .build());
        }

        String responseCode = params.get("vnp_ResponseCode");
        String orderId = params.get("vnp_TxnRef");
        String transactionId = params.get("vnp_TransactionNo");

        if ("00".equals(responseCode)) {
            paymentService.markSuccess(orderId, transactionId);
            return ResponseEntity.ok(PaymentVerifyResponseDto.builder()
                    .success(true)
                    .orderId(orderId)
                    .transactionId(transactionId)
                    .message("Thanh toán thành công")
                    .build());
        }

        paymentService.markFailed(orderId, "VNPay responseCode=" + responseCode);
        return ResponseEntity.ok(PaymentVerifyResponseDto.builder()
                .success(false)
                .orderId(orderId)
                .message("Thanh toán thất bại, mã lỗi: " + responseCode)
                .build());
    }
}
