package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.InvalidatedToken;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
    boolean existsByToken(String token);
    void deleteByExpiryTimeBefore(LocalDateTime now);
}
