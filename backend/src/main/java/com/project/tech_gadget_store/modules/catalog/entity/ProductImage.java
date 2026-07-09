package com.project.tech_gadget_store.modules.catalog.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductImage extends BaseEntity {

    @Column(name = "name", length = 150)
    private String name;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    public ProductImage(Product product, String name, String imageUrl) {
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("imageUrl must not be blank");
        }
        this.name = name;
        this.imageUrl = imageUrl;
        product.addImage(this);
    }
}
