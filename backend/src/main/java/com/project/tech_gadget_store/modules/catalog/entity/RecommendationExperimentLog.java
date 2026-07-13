package com.project.tech_gadget_store.modules.catalog.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 1 dòng = 1 lần "Dành cho bạn" hiện 1 sản phẩm cho 1 khách, gắn kèm variant (MF hay
 * RULE_BASED_HOLDOUT — xem {@code RecommendationService}). {@code createdAt} (kế thừa từ
 * {@link BaseEntity}) đóng vai trò "shownAt". {@code clickedAt} null nghĩa là khách chưa bấm
 * vào sản phẩm này — được set khi frontend gọi lại endpoint đánh dấu click.
 *
 * customerId/productId lưu dạng String thuần (không @ManyToOne) — chỉ dùng để gộp nhóm/đếm,
 * không cần navigate sang entity Customer/Product, tránh rủi ro lazy-loading không cần thiết.
 */
@Entity
@Table(name = "recommendation_experiment_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecommendationExperimentLog extends BaseEntity {

    @Column(name = "customer_id", nullable = false, length = 36)
    private String customerId;

    @Column(name = "variant", nullable = false, length = 30)
    private String variant;

    @Column(name = "product_id", nullable = false, length = 36)
    private String productId;

    @Column(name = "clicked_at")
    private LocalDateTime clickedAt;

    public RecommendationExperimentLog(String customerId, String variant, String productId) {
        this.customerId = customerId;
        this.variant = variant;
        this.productId = productId;
    }

    public void markClicked() {
        if (clickedAt == null) {
            clickedAt = LocalDateTime.now();
        }
    }
}
