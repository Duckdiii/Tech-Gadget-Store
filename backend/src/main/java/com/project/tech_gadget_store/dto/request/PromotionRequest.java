package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class PromotionRequest {
    @NotBlank(message = "Ten chuong trinh khong duoc de trong")
    @Size(max = 255, message = "Ten chuong trinh toi da 255 ky tu")
    private String name;

    private String description;

    @NotBlank(message = "Loai giam gia khong duoc de trong")
    @Pattern(regexp = "PERCENT|FIXED_AMOUNT", message = "Loai giam gia phai la PERCENT hoac FIXED_AMOUNT")
    private String discountType;

    @NotNull(message = "Gia tri giam gia khong duoc de trong")
    @DecimalMin(value = "0.01", message = "Gia tri giam gia phai lon hon 0")
    private BigDecimal discountValue;

    @NotNull(message = "Ngay bat dau khong duoc de trong")
    private OffsetDateTime startDate;

    @NotNull(message = "Ngay ket thuc khong duoc de trong")
    private OffsetDateTime endDate;

    private Boolean isActive;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public OffsetDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(OffsetDateTime startDate) {
        this.startDate = startDate;
    }

    public OffsetDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(OffsetDateTime endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
