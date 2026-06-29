package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, String> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, String id);

    List<Promotion> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(DISTINCT o.id) FROM Order o JOIN o.items oi JOIN oi.productVariant pv JOIN pv.product prod JOIN prod.promotions promo WHERE promo.id = :promotionId AND o.orderDate >= :startAt AND o.orderDate <= :endAt")
    long countOrdersByPromotion(@Param("promotionId") String promotionId,
                                @Param("startAt") LocalDateTime startAt,
                                @Param("endAt") LocalDateTime endAt);

    @Query("SELECT COALESCE(SUM(oi.unitPriceAtOrder * oi.quantity), 0) FROM Order o JOIN o.items oi JOIN oi.productVariant pv JOIN pv.product prod JOIN prod.promotions promo WHERE promo.id = :promotionId AND o.orderDate >= :startAt AND o.orderDate <= :endAt")
    BigDecimal sumRevenueByPromotion(@Param("promotionId") String promotionId,
                                     @Param("startAt") LocalDateTime startAt,
                                     @Param("endAt") LocalDateTime endAt);

    @Query("SELECT COUNT(DISTINCT p) FROM Promotion p WHERE p.active = true AND p.startAt <= :now AND p.endAt >= :now")
    long countActiveNow(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(DISTINCT o.id) FROM Order o JOIN o.items oi JOIN oi.productVariant pv JOIN pv.product prod JOIN prod.promotions promo WHERE o.orderDate >= promo.startAt AND o.orderDate <= promo.endAt")
    long countTotalOrdersAcrossAllPromotions();

    @Query("SELECT COALESCE(SUM(oi.unitPriceAtOrder * oi.quantity), 0) FROM Order o JOIN o.items oi JOIN oi.productVariant pv JOIN pv.product prod JOIN prod.promotions promo WHERE o.orderDate >= promo.startAt AND o.orderDate <= promo.endAt")
    BigDecimal sumTotalRevenueAcrossAllPromotions();
}
