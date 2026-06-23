package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, String> {

    void deleteByAccountId(String accountId);
}
