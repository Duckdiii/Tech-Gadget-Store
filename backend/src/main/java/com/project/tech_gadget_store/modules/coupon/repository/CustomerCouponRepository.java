package com.project.tech_gadget_store.modules.coupon.repository;

import com.project.tech_gadget_store.modules.coupon.entity.CustomerCoupon;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerCouponRepository extends JpaRepository<CustomerCoupon, String> {

    List<CustomerCoupon> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    Optional<CustomerCoupon> findByCustomerIdAndCouponId(String customerId, String couponId);

    long countByCouponId(String couponId);
}
