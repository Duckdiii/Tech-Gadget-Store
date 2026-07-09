package com.project.tech_gadget_store.modules.notification.event;

import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import java.util.List;
import lombok.Getter;


@Getter
public class ProductPromotionAppliedEvent {
    private final Promotion promotion;
    private final List<Product> products;

    public ProductPromotionAppliedEvent(Promotion promotion, List<Product> products) {
        this.promotion = promotion;
        this.products = products;
    }
}
