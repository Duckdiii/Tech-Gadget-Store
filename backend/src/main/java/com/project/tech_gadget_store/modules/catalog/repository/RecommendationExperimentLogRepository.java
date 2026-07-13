package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.RecommendationExperimentLog;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RecommendationExperimentLogRepository extends JpaRepository<RecommendationExperimentLog, String> {

    Optional<RecommendationExperimentLog> findByIdAndCustomerId(String id, String customerId);

    /**
     * Gom theo variant: mỗi hàng trả về {@code [variant, shownCount, clickedCount]}. Đọc bằng
     * index trong {@code RecommendationExperimentService} thay vì tạo thêm 1 DTO/projection
     * riêng chỉ cho đúng 1 truy vấn này.
     */
    @Query("SELECT r.variant, COUNT(r), SUM(CASE WHEN r.clickedAt IS NOT NULL THEN 1 ELSE 0 END) "
            + "FROM RecommendationExperimentLog r GROUP BY r.variant")
    List<Object[]> countShownAndClickedByVariant();
}
