package com.project.tech_gadget_store.dto.request;

public class GoodsReceiptRequest {
    private java.util.UUID variantId;
    private Integer quantity;
    private java.math.BigDecimal importPrice;
    private String supplier;
    private String note;

    public java.util.UUID getVariantId() {
        return variantId;
    }

    public void setVariantId(java.util.UUID variantId) {
        this.variantId = variantId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public java.math.BigDecimal getImportPrice() {
        return importPrice;
    }

    public void setImportPrice(java.math.BigDecimal importPrice) {
        this.importPrice = importPrice;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

}
