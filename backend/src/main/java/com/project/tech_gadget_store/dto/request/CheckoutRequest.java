package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class CheckoutRequest { // DTO cho việc thanh toán đơn hàng
    @NotNull(message = "OrderId khong duoc de trong")
    private UUID orderId;

    @NotBlank(message = "Dia chi giao hang khong duoc de trong")
    @Size(max = 500, message = "Dia chi giao hang toi da 500 ky tu")
    private String shippingAddress;

    @NotBlank(message = "So dien thoai nguoi nhan khong duoc de trong")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "So dien thoai nguoi nhan khong hop le")
    private String receiverPhone;

    @NotBlank(message = "Ten nguoi nhan khong duoc de trong")
    @Size(max = 255, message = "Ten nguoi nhan toi da 255 ky tu")
    private String receiverName;

    @NotBlank(message = "Phuong thuc thanh toan khong duoc de trong")
    @Pattern(regexp = "COD|VNPAY", message = "Phuong thuc thanh toan phai la COD hoac VNPAY")
    private String paymentMethod;

    @Size(max = 1000, message = "Ghi chu toi da 1000 ky tu")
    private String note;

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
