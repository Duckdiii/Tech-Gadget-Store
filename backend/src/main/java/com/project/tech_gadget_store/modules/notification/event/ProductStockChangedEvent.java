package com.project.tech_gadget_store.modules.notification.event;

import com.project.tech_gadget_store.modules.catalog.entity.Product;
import lombok.Getter;


@Getter
public class ProductStockChangedEvent {
    private final Product product;
    private final long oldStock;
    private final long newStock;

    public ProductStockChangedEvent(Product product, long oldStock, long newStock) {
        this.product = product;
        this.oldStock = oldStock;
        this.newStock = newStock;
    }
}
