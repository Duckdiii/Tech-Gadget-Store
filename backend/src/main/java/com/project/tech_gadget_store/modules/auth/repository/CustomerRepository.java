package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface CustomerRepository extends JpaRepository<Customer, String> {
    @Query("SELECT c FROM Customer c JOIN c.account a LEFT JOIN c.membership m WHERE a.email = :email")
    Optional<Customer> findMembershipByCustomerId(String email);

    @Query("SELECT c FROM Customer c JOIN c.account a WHERE a.email = :email")
    Optional<Customer> findByAccountEmail(String email);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Manager customer list: search by name/email/phone (optional) + filter by membership tier
    // (optional) + filter by registration date range (optional) + filter by completed spending range (optional).
    // Both filters are nullable so the same query serves "no filter" and "filtered"
    // calls alike. :search must be CAST to string.
    @Query(value = "SELECT c, " +
            "(SELECT COUNT(DISTINCT o.id) FROM Order o WHERE o.customer.id = c.id AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED AND o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.REFUNDED) as totalOrders, " +
            "(SELECT COALESCE(SUM(oi.unitPriceAtOrder * oi.quantity), 0) FROM Order o JOIN o.items oi WHERE o.customer.id = c.id AND o.orderStatus = com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.COMPLETED) as totalSpend " +
            "FROM Customer c JOIN c.account a JOIN c.membership m WHERE " +
            "(CAST(:search as string) IS NULL " +
            "  OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', CAST(:search as string), '%')) " +
            "  OR LOWER(a.email) LIKE LOWER(CONCAT('%', CAST(:search as string), '%')) " +
            "  OR LOWER(c.phone) LIKE LOWER(CONCAT('%', CAST(:search as string), '%'))) " +
            "AND (:tier IS NULL OR m.tier = :tier) " +
            "AND (cast(:joinStartDate as timestamp) IS NULL OR c.createdAt >= :joinStartDate) " +
            "AND (cast(:joinEndDate as timestamp) IS NULL OR c.createdAt <= :joinEndDate) " +
            "AND (:minSpend IS NULL OR (SELECT COALESCE(SUM(oi.unitPriceAtOrder * oi.quantity), 0) FROM Order o JOIN o.items oi WHERE o.customer.id = c.id AND o.orderStatus = com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.COMPLETED) >= :minSpend) " +
            "AND (:maxSpend IS NULL OR (SELECT COALESCE(SUM(oi.unitPriceAtOrder * oi.quantity), 0) FROM Order o JOIN o.items oi WHERE o.customer.id = c.id AND o.orderStatus = com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.COMPLETED) <= :maxSpend) " +
            "AND (:onlyRepeat IS NULL OR :onlyRepeat = false OR (SELECT COUNT(o.id) FROM Order o WHERE o.customer.id = c.id AND o.orderStatus = com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.COMPLETED) >= 2)",
            countQuery = "SELECT COUNT(c) FROM Customer c JOIN c.account a JOIN c.membership m WHERE " +
            "(CAST(:search as string) IS NULL " +
            "  OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', CAST(:search as string), '%')) " +
            "  OR LOWER(a.email) LIKE LOWER(CONCAT('%', CAST(:search as string), '%')) " +
            "  OR LOWER(c.phone) LIKE LOWER(CONCAT('%', CAST(:search as string), '%'))) " +
            "AND (:tier IS NULL OR m.tier = :tier) " +
            "AND (cast(:joinStartDate as timestamp) IS NULL OR c.createdAt >= :joinStartDate) " +
            "AND (cast(:joinEndDate as timestamp) IS NULL OR c.createdAt <= :joinEndDate) " +
            "AND (:minSpend IS NULL OR (SELECT COALESCE(SUM(oi.unitPriceAtOrder * oi.quantity), 0) FROM Order o JOIN o.items oi WHERE o.customer.id = c.id AND o.orderStatus = com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.COMPLETED) >= :minSpend) " +
            "AND (:maxSpend IS NULL OR (SELECT COALESCE(SUM(oi.unitPriceAtOrder * oi.quantity), 0) FROM Order o JOIN o.items oi WHERE o.customer.id = c.id AND o.orderStatus = com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.COMPLETED) <= :maxSpend) " +
            "AND (:onlyRepeat IS NULL OR :onlyRepeat = false OR (SELECT COUNT(o.id) FROM Order o WHERE o.customer.id = c.id AND o.orderStatus = com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.COMPLETED) >= 2)")
    Page<Object[]> searchCustomers(
            @Param("search") String search, 
            @Param("tier") MembershipTier tier,
            @Param("joinStartDate") LocalDateTime joinStartDate,
            @Param("joinEndDate") LocalDateTime joinEndDate,
            @Param("minSpend") BigDecimal minSpend,
            @Param("maxSpend") BigDecimal maxSpend,
            @Param("onlyRepeat") Boolean onlyRepeat,
            Pageable pageable);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.membership.tier IN :tiers")
    long countByMembershipTierIn(@Param("tiers") List<MembershipTier> tiers);
}
