package com.project.tech_gadget_store.modules.coupon.repository;

import com.project.tech_gadget_store.modules.coupon.entity.Coupon;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CouponRepository extends JpaRepository<Coupon, String> {

    @Query("SELECT c FROM Coupon c WHERE c.active = true AND c.startAt <= :now AND c.endAt >= :now ORDER BY c.endAt ASC")
    List<Coupon> findCurrentlyValid(@Param("now") LocalDateTime now);
}
