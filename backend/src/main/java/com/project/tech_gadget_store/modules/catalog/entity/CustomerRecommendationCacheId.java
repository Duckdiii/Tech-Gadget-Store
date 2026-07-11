package com.project.tech_gadget_store.modules.catalog.entity;

import java.io.Serializable;
import java.util.Objects;

/** Composite primary key for {@link CustomerRecommendationCache} — (customerId, rank). */
public class CustomerRecommendationCacheId implements Serializable {

    private String customerId;
    private Integer rank;

    public CustomerRecommendationCacheId() {
    }

    public CustomerRecommendationCacheId(String customerId, Integer rank) {
        this.customerId = customerId;
        this.rank = rank;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CustomerRecommendationCacheId that)) {
            return false;
        }
        return Objects.equals(customerId, that.customerId) && Objects.equals(rank, that.rank);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId, rank);
    }
}
