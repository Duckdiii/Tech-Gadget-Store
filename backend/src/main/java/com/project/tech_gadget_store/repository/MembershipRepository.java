package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Membership;
import com.project.tech_gadget_store.entity.enums.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, String> {

    Optional<Membership> findByTier(MembershipTier tier);

    @Query("SELECT m FROM Membership m WHERE " +
            "(m.minSpending IS NULL OR m.minSpending <= :spending) AND " +
            "(m.maxSpending IS NULL OR m.maxSpending >= :spending)")
    Optional<Membership> findBySpending(BigDecimal spending);
}
