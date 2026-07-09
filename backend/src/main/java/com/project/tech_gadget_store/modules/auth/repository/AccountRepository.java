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

    Optional<Account> findByResetToken(String resetToken);

    boolean existsByEmail(String email);

    @Query("SELECT a FROM Account a WHERE TYPE(a.user) IN (Manager, Staff) AND a.status = :status")
    List<Account> findManagerAndStaffAccountsByStatus(@Param("status") AccountStatus status);
}
