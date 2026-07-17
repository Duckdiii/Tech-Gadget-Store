package com.project.tech_gadget_store.modules.order.repository;

import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, String> {

        @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId ORDER BY o.orderDate DESC")
        Page<Order> findRecentOrdersByCustomerId(String customerId, Pageable pageable);

        Page<Order> findOrdersByCustomerId(String customerId, Pageable pageable);

        @Query("SELECT o FROM Order o WHERE " +
                        "(:customerId IS NULL OR o.customer.id = :customerId) AND " +
                        "(:status IS NULL OR o.orderStatus = :status) AND " +
                        "(cast(:cursorTimestamp as timestamp) IS NULL OR o.orderDate < :cursorTimestamp OR " +
                        "(o.orderDate = :cursorTimestamp AND o.id < :cursorId)) " +
                        "ORDER BY o.orderDate DESC, o.id DESC")
        List<Order> findOrdersCursor(
                        @Param("customerId") String customerId,
                        @Param("status") OrderStatus status,
                        @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
                        @Param("cursorId") String cursorId,
                        Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
                        "AND o.orderDate >= :from AND o.orderDate <= :to " +
                        "ORDER BY o.orderDate DESC")
        Page<Order> findByCustomerIdAndDateRange(String customerId, LocalDateTime from, LocalDateTime to,
                        Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
                        "AND YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month AND DAY(o.orderDate) = :day " +
                        "ORDER BY o.orderDate DESC")
        Page<Order> findByCustomerIdAndDay(String customerId, int year, int month, int day, Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
                        "AND YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month " +
                        "ORDER BY o.orderDate DESC")
        Page<Order> findByCustomerIdAndMonth(String customerId, int year, int month, Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId " +
                        "AND YEAR(o.orderDate) = :year " +
                        "ORDER BY o.orderDate DESC")
        Page<Order> findByCustomerIdAndYear(String customerId, int year, Pageable pageable);

        Page<Order> findOrdersByCustomerIdAndOrderStatus(String customerId, String status, Pageable pageable);

        @Query("SELECT COALESCE(SUM(i.unitPriceAtOrder * i.quantity), 0) " +
                        "FROM Order o JOIN o.items i " +
                        "WHERE o.customer.id = :customerId AND o.orderStatus = :status")
        BigDecimal sumSpentByCustomerIdAndStatus(String customerId, OrderStatus status);

        @Query("SELECT COALESCE(SUM(i.unitPriceAtOrder * i.quantity), 0) " +
                        "FROM Order o JOIN o.items i " +
                        "WHERE o.customer.id = :customerId AND o.orderStatus = :status " +
                        "AND o.orderDate >= :from AND o.orderDate <= :to")
        BigDecimal sumSpentByCustomerIdAndStatusAndDateRange(String customerId, OrderStatus status,
                        LocalDateTime from, LocalDateTime to);

        @Query("SELECT o FROM Order o JOIN o.items i WHERE i.id = :orderItemId")
        java.util.Optional<Order> findByOrderItemId(@Param("orderItemId") String orderItemId);

        @Query("SELECT DISTINCT p.category.id FROM Order o JOIN o.items oi JOIN oi.productVariant pv JOIN pv.product p "
                        +
                        "WHERE o.customer.id = :customerId AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED")
        List<String> findPurchasedCategoryIdsByCustomerId(@Param("customerId") String customerId); // trả về danh sách
                                                                                                   // category ID mà một
                                                                                                   // customer đã từng
                                                                                                   // mua (loại trừ đơn
                                                                                                   // đã hủy)

        @Query("SELECT DISTINCT pv.product.id FROM Order o JOIN o.items oi JOIN oi.productVariant pv " +
                        "WHERE o.customer.id = :customerId AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED")
        List<String> findPurchasedProductIdsByCustomerId(@Param("customerId") String customerId); // trả về danh sách
                                                                                                  // Product ID mà
                                                                                                  // customer đã từng
                                                                                                  // mua (cũng loại trừ
                                                                                                  // đơn đã hủy)

        // Product id + tổng số lượng đã bán, xếp giảm dần — dùng cho tab "Bán chạy" ở trang chủ.
        // Loại trừ đơn đã hủy vì đơn đó không phản ánh nhu cầu thực.
        @Query("SELECT pv.product.id, SUM(oi.quantity) FROM Order o JOIN o.items oi JOIN oi.productVariant pv " +
                        "WHERE o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED "
                        +
                        "GROUP BY pv.product.id ORDER BY SUM(oi.quantity) DESC")
        List<Object[]> findBestsellingProductIds(Pageable pageable);

        @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM Order o JOIN o.items oi JOIN oi.productVariant pv " +
                        "WHERE pv.product.id = :productId AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED")
        Integer countSalesByProductId(@Param("productId") String productId);

        @Query("SELECT pv.product.id, COALESCE(SUM(oi.quantity), 0) FROM Order o JOIN o.items oi JOIN oi.productVariant pv " +
                        "WHERE pv.product.id IN :productIds AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED " +
                        "GROUP BY pv.product.id")
        List<Object[]> countProductSalesForList(@Param("productIds") List<String> productIds);

        // "Đơn hàng mới" cho manager dashboard: đếm mọi đơn phát sinh trong khoảng thời gian, trừ
        // đơn đã hủy/hoàn tiền — khớp quy ước loại trừ CANCELLED đã dùng ở các query khác trong
        // file này (đơn hủy "không phản ánh nhu cầu thực"). Khác với RevenueReportService, vốn
        // chỉ đếm đơn COMPLETED vì đó là số liệu doanh thu, không phải số liệu khối lượng đơn.
        @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate >= :from AND o.orderDate <= :to " +
                        "AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED " +
                        "AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.REFUNDED")
        long countActiveOrdersByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
