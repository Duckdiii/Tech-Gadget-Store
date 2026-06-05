package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Brand extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "brand", fetch = FetchType.LAZY)
    private List<Product> products = new ArrayList<>();

    public Brand(String name, String logoUrl, String description) {
        updateInfo(name, logoUrl, description);
    }

    public void addProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        if (product.getBrand() != null && product.getBrand() != this) {
            product.getBrand().getProducts().remove(product);
        }
        if (!products.contains(product)) {
            products.add(product);
        }
        product.setBrand(this);
    }

    public void removeProduct(Product product) {
        if (product == null) {
            return;
        }
        if (products.remove(product)) {
            product.setBrand(null);
        }
    }

    public void updateInfo(String name, String logoUrl, String description) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        this.name = name;
        this.logoUrl = logoUrl;
        this.description = description;
    }
}
