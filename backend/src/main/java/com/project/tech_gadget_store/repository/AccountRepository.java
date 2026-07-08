package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByEmail(String email);

    Optional<Account> findByResetToken(String resetToken);

    boolean existsByEmail(String email);

    @Query("SELECT a FROM Account a WHERE TYPE(a.user) IN (Manager, Staff) AND a.status = :status")
    List<Account> findManagerAndStaffAccountsByStatus(@Param("status") AccountStatus status);
}
