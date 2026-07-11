package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.CustomerRecommendationCache;
import com.project.tech_gadget_store.modules.catalog.entity.CustomerRecommendationCacheId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRecommendationCacheRepository
        extends JpaRepository<CustomerRecommendationCache, CustomerRecommendationCacheId> {

    List<CustomerRecommendationCache> findByCustomerIdOrderByRankAsc(String customerId);
}
