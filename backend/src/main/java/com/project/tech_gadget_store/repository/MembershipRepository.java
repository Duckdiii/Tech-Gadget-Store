package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Membership;
import com.project.tech_gadget_store.entity.enums.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, String> {
    Optional<Membership> findByTier(MembershipTier tier);
}
