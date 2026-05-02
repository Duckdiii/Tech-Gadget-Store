package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public class OrderRequest {
    private UUID voucherId;

    @NotNull(message = "Ma don hang khong duoc de trong")
    private String orderCode;

    @NotNull(message = "Danh sach san pham khong duoc de trong")
    @Size(min = 1, message = "Don hang phai co it nhat 1 san pham")
    private List<@Valid ItemRequest> items;

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
    @Pattern(regexp = "COD|VNPAY|MOMO", message = "Phuong thuc thanh toan phai la COD, VNPAY hoac MOMO")
    private String paymentMethod;

    @Size(max = 1000, message = "Ghi chu toi da 1000 ky tu")
    private String note;

    public UUID getVoucherId() {
        return voucherId;
    }

    public void setVoucherId(UUID voucherId) {
        this.voucherId = voucherId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
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

    public static class ItemRequest {
        @NotNull(message = "VariantId khong duoc de trong")
        private UUID variantId;

        @NotNull(message = "So luong khong duoc de trong")
        @Min(value = 1, message = "So luong phai lon hon 0")
        private Integer quantity;

        public UUID getVariantId() {
            return variantId;
        }

        public void setVariantId(UUID variantId) {
            this.variantId = variantId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
