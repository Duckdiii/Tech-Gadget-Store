package com.project.tech_gadget_store.modules.chatbot.service;

import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ForYouItemDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.ProductService;
import com.project.tech_gadget_store.modules.catalog.service.RecommendationService;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ChatToolService {

    private static final int SEARCH_LIMIT = 5; // Giới hạn số sản phẩm trả về khi tìm kiếm để tránh quá dài, model đọc
                                               // không nổi

    private final ProductService productService;// Dùng để gọi API tìm kiếm sản phẩm
    private final RecommendationService recommendationService;// Dùng để gọi API gợi ý cá nhân hoá
    private final OrderRepository orderRepository;// Dùng để gọi API tra cứu trạng thái đơn hàng

    public ChatToolService(
            ProductService productService,
            RecommendationService recommendationService,
            OrderRepository orderRepository) {
        this.productService = productService;
        this.recommendationService = recommendationService;
        this.orderRepository = orderRepository;
    }

    // Tìm kiếm sản phẩm theo từ khoá, trả về một đoạn text mô tả ngắn gọn các sản
    // phẩm tìm được
    public String searchProducts(String keyword) {
        ProductFilterRequestDto filter = ProductFilterRequestDto.builder()
                .keyword(keyword)
                .page(0)
                .size(SEARCH_LIMIT)
                .build();
        ProductPageResponseDto page = productService.findProductsByFilter(filter);
        if (page.getItems().isEmpty()) {
            return "Không tìm thấy sản phẩm nào phù hợp với từ khoá \"" + keyword + "\".";
        }
        return page.getItems().stream().map(this::formatProduct).collect(Collectors.joining("\n"));
    }

    // Lấy gợi ý cá nhân hoá cho khách hàng theo customerId, trả về một đoạn text mô
    // tả ngắn gọn các sản phẩm gợi ý
    public String getRecommendations(String customerId) {
        List<ForYouItemDto> items = recommendationService.getForYouRecommendations(customerId).getItems();
        if (items.isEmpty()) {
            return "Hiện chưa có gợi ý cá nhân hoá nào cho khách hàng này.";
        }
        return items.stream()
                .map(ForYouItemDto::getProduct)
                .map(this::formatProduct)
                .collect(Collectors.joining("\n"));
    }

    // Tra cứu trạng thái đơn hàng theo orderId và customerId, trả về một đoạn text
    // mô tả ngắn gọn
    public String getOrderStatus(String orderId, String customerId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null
                || order.getCustomer() == null
                || !customerId.equals(order.getCustomer().getId())) {
            return "Không tìm thấy đơn hàng \"" + orderId + "\" thuộc về khách hàng này.";
        }

        return "Đơn hàng %s: trạng thái %s, đặt ngày %s, tổng tiền %s, gồm %d sản phẩm."
                .formatted(
                        order.getId(),
                        order.getOrderStatus(),
                        order.getOrderDate(),
                        order.calculateTotal(),
                        order.getItems().size());
    }

    // Format một sản phẩm thành một đoạn text ngắn gọn để model đọc và diễn giải
    // lại cho khách
    private String formatProduct(ProductResponseDto product) {
        return "- %s (%s, %s): giá từ %s đ".formatted(
                product.getName(),
                product.getBrandName(),
                product.getCategoryName(),
                product.getMinPrice());
    }
}
