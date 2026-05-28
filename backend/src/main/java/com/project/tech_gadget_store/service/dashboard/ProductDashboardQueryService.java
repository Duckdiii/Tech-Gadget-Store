package com.project.tech_gadget_store.service.dashboard;

import com.project.tech_gadget_store.entity.OrderItem;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.repository.OrderItemRepository;
import com.project.tech_gadget_store.repository.OrderRepository;
import com.project.tech_gadget_store.repository.ProductRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import com.project.tech_gadget_store.service.LowStockItem;
import com.project.tech_gadget_store.service.TopProductItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductDashboardQueryService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    public Flux<TopProductItem> getTopSellingProducts(int topN) {
        if (topN <= 0) {
            return Flux.empty();
        }

        return orderRepository.findAllByOrderStatus(OrderStatus.COMPLETED.name())
                .flatMap(order -> orderItemRepository.findAllByOrderId(order.getId()))
                .groupBy(OrderItem::getVariantId)
                .flatMap(group -> group.collectList().flatMap(items -> {
                    long soldQuantity = items.stream()
                            .mapToLong(item -> item.getQuantity() == null ? 0 : item.getQuantity())
                            .sum();

                    BigDecimal revenue = items.stream()
                            .map(item -> {
                                BigDecimal unitPrice = item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice();
                                int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
                                return unitPrice.multiply(BigDecimal.valueOf(quantity));
                            })
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return productVariantRepository.findById(group.key())
                            .flatMap(variant -> productRepository.findById(variant.getProductId())
                                    .map(product -> new TopProductItem(
                                            variant.getProductId(),
                                            product.getName(),
                                            variant.getId(),
                                            variant.getVariantName(),
                                            soldQuantity,
                                            revenue)))
                            .switchIfEmpty(Mono.just(new TopProductItem(
                                    null,
                                    "Unknown Product",
                                    group.key(),
                                    "Unknown Variant",
                                    soldQuantity,
                                    revenue)));
                }))
                .sort((a, b) -> {
                    int byQuantity = b.soldQuantity().compareTo(a.soldQuantity());
                    return byQuantity != 0 ? byQuantity : b.revenue().compareTo(a.revenue());
                })
                .take(topN);
    }

    public Flux<LowStockItem> getLowStockProducts(int threshold) {
        return productVariantRepository.findAll()
                .filter(variant -> variant.getStockQuantity() != null && variant.getStockQuantity() <= threshold)
                .flatMap(variant -> productRepository.findById(variant.getProductId())
                        .map(product -> new LowStockItem(
                                variant.getId(),
                                variant.getProductId(),
                                variant.getVariantName(),
                                variant.getStockQuantity(),
                                threshold)))
                .switchIfEmpty(Flux.empty());
    }
}
