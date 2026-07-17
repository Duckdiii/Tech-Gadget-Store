package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.Manager;
import com.project.tech_gadget_store.modules.auth.entity.Staff;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByEmail(String email);

    // JOIN FETCH user để tránh N+1: load Account + User trong 1 query duy nhất
    // phục vụ JwtAuthFilter / CustomUserDetailsService trên mỗi request
    @Query("SELECT a FROM Account a JOIN FETCH a.user WHERE a.email = :email")
    Optional<Account> findByEmailWithUser(@Param("email") String email);

    boolean existsByEmail(String email);

    @Query("SELECT a FROM Account a WHERE TYPE(a.user) IN (Manager, Staff) AND a.status = :status")
    List<Account> findManagerAndStaffAccountsByStatus(@Param("status") AccountStatus status);
}
