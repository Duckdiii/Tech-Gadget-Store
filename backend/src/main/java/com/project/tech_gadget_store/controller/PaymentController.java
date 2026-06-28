package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.MomoIpnCallbackDto;
import com.project.tech_gadget_store.dto.request.PaymentCreateRequestDto;
import com.project.tech_gadget_store.dto.response.MomoPaymentResponseDto;
import com.project.tech_gadget_store.dto.response.VNPayPaymentResponseDto;
import com.project.tech_gadget_store.entity.PaymentLog;
import com.project.tech_gadget_store.repository.PaymentLogRepository;
import com.project.tech_gadget_store.service.MomoService;
import com.project.tech_gadget_store.service.PaymentService;
import com.project.tech_gadget_store.service.VNPayService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final MomoService momoService;
    private final VNPayService vnpayService;
    private final PaymentService paymentService;
    private final PaymentLogRepository paymentLogRepository;

    public PaymentController(MomoService momoService,
            VNPayService vnpayService,
            PaymentService paymentService,
            PaymentLogRepository paymentLogRepository) {
        this.momoService = momoService;
        this.vnpayService = vnpayService;
        this.paymentService = paymentService;
        this.paymentLogRepository = paymentLogRepository;
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
     * Nhận redirect từ VNPay sau khi user thanh toán.
     * Redirect người dùng về trang Invoice của FE.
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> handleVNPayReturn(
            @RequestParam Map<String, String> params) {
        String orderId = params.get("vnp_TxnRef"); // mapping to pendingLog.getId()
        String transactionId = params.get("vnp_TransactionNo");
        String responseCode = params.get("vnp_ResponseCode");

        if (vnpayService.verifyReturnHash(params) && "00".equals(responseCode)) {
            paymentService.markSuccess(orderId, transactionId);
            PaymentLog logRecord = paymentLogRepository.findById(orderId).orElse(null);
            String targetOrderId = logRecord != null && logRecord.getOrder() != null ? logRecord.getOrder().getId()
                    : "";
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION,
                            "http://localhost:5173/invoice?orderId=" + targetOrderId + "&success=true")
                    .build();
        }

        paymentService.markFailed(orderId, "VNPay responseCode=" + responseCode);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "http://localhost:5173/checkout?error=PaymentFailed")
                .build();
    }

    /**
     * Nhận redirect từ MoMo sau khi user thanh toán.
     * Redirect người dùng về trang Invoice của FE.
     */
    @GetMapping("/momo/return")
    public ResponseEntity<Void> handleMomoReturn(
            @RequestParam Map<String, String> params) {
        String orderId = params.get("orderId"); // mapping to pendingLog.getId()
        String transactionId = params.get("transId");
        String resultCode = params.get("resultCode");

        if ("0".equals(resultCode)) {
            paymentService.markSuccess(orderId, transactionId);
            PaymentLog logRecord = paymentLogRepository.findById(orderId).orElse(null);
            String targetOrderId = logRecord != null && logRecord.getOrder() != null ? logRecord.getOrder().getId()
                    : "";
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION,
                            "http://localhost:5173/invoice?orderId=" + targetOrderId + "&success=true")
                    .build();
        }

        paymentService.markFailed(orderId, "MoMo resultCode=" + resultCode);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "http://localhost:5173/checkout?error=PaymentFailed")
                .build();
    }
}
