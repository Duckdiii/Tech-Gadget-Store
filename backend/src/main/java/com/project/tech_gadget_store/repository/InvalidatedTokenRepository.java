package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
    boolean existsByToken(String token);
    void deleteByExpiryTimeBefore(LocalDateTime now);
}
