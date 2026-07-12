package com.project.tech_gadget_store.modules.warehouse.service;

import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.warehouse.dto.response.LowStockProductResponseDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.LowStockSummaryResponseDto;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional(readOnly = true)
public class LowStockService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final long lowStockThreshold;

    public LowStockService(
            ProductVariantRepository productVariantRepository,
            ProductRepository productRepository,
            @Value("${app.inventory.low-stock-threshold:5}") long lowStockThreshold) {
        this.productVariantRepository = productVariantRepository;
        this.productRepository = productRepository;
        this.lowStockThreshold = lowStockThreshold;
    }

    public LowStockSummaryResponseDto getLowStockSummary(int limit) {
        List<Object[]> rows = productVariantRepository.findLowStockProductIdsAndCounts(lowStockThreshold);

        Map<String, Long> stockByProductId = new LinkedHashMap<>();
        for (Object[] row : rows) {
            stockByProductId.put((String) row[0], (Long) row[1]);
        }

        List<Product> products = productRepository.findAllByIdWithImages(new ArrayList<>(stockByProductId.keySet()));
        Map<String, Product> productById = new LinkedHashMap<>();
        for (Product product : products) {
            productById.put(product.getId(), product);
        }

        List<LowStockProductResponseDto> allItems = new ArrayList<>();
        for (Map.Entry<String, Long> entry : stockByProductId.entrySet()) {
            Product product = productById.get(entry.getKey());
            if (product == null || !Boolean.TRUE.equals(product.getIsActive())) {
                continue;
            }
            String imageUrl = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();
            allItems.add(LowStockProductResponseDto.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .imageUrl(imageUrl)
                    .stock(entry.getValue())
                    .build());
        }

        List<LowStockProductResponseDto> items = allItems.size() > limit
                ? allItems.subList(0, limit)
                : allItems;

        return LowStockSummaryResponseDto.builder()
                .totalCount(allItems.size())
                .threshold(lowStockThreshold)
                .items(items)
                .build();
    }
}
