package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
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

    // Manager customer list: search by name/email (optional) + filter by membership tier
    // (optional). Both filters are nullable so the same query serves "no filter" and "filtered"
    // calls alike. :search must be CAST to string — with a bare "LOWER(:search)" and a null
    // value, Postgres can't infer the parameter's type and fails with "function lower(bytea)
    // does not exist" (same class of issue as the cast(:cursorTimestamp as timestamp) in
    // OrderRepository.findOrdersCursor).
    @Query("SELECT c FROM Customer c JOIN c.account a JOIN c.membership m WHERE " +
            "(CAST(:search as string) IS NULL " +
            "OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', CAST(:search as string), '%')) " +
            "OR LOWER(a.email) LIKE LOWER(CONCAT('%', CAST(:search as string), '%'))) " +
            "AND (:tier IS NULL OR m.tier = :tier)")
    Page<Customer> searchCustomers(@Param("search") String search, @Param("tier") MembershipTier tier,
            Pageable pageable);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.membership.tier IN :tiers")
    long countByMembershipTierIn(@Param("tiers") List<MembershipTier> tiers);
}
