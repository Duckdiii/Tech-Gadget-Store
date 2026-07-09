package com.project.tech_gadget_store.event;

import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.Promotion;
import lombok.Getter;
import java.util.List;

@Getter
public class ProductPromotionAppliedEvent {
    private final Promotion promotion;
    private final List<Product> products;

    public ProductPromotionAppliedEvent(Promotion promotion, List<Product> products) {
        this.promotion = promotion;
        this.products = products;
    }
}
