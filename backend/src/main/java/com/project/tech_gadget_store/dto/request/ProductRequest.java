package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class ProductRequest {
    @NotNull(message = "CategoryId khong duoc de trong")
    private UUID categoryId;

    @NotNull(message = "BrandId khong duoc de trong")
    private UUID brandId;

    @NotBlank(message = "Ten san pham khong duoc de trong")
    @Size(max = 255, message = "Ten san pham toi da 255 ky tu")
    private String name;

    @Size(max = 5000, message = "Mo ta san pham toi da 5000 ky tu")
    private String description;

    private Boolean isActive;

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public UUID getBrandId() {
        return brandId;
    }

    public void setBrandId(UUID brandId) {
        this.brandId = brandId;
    }

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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
