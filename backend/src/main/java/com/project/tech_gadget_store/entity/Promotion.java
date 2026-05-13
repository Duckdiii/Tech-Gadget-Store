package com.project.tech_gadget_store.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("promotions")
public class Promotion {
    private static final Set<String> SUPPORTED_DISCOUNT_TYPES = Set.of("PERCENT", "FIXED_AMOUNT");

    @Id
    private UUID id;

    private String name;

    private String description;

    @Column("discount_type")
    private String discountType;

    @Column("discount_value")
    private BigDecimal discountValue;

    @Column("start_date")
    private OffsetDateTime startDate;

    @Column("end_date")
    private OffsetDateTime endDate;

    @Column("is_active")
    private Boolean isActive;

    @Column("created_at")
    private OffsetDateTime createdAt;

    @Column("updated_at")
    private OffsetDateTime updatedAt;

    public static void validatePromotionId(UUID promotionId) {
        if (promotionId == null) {
            throw new IllegalArgumentException("Promotion ID cannot be null");
        }
    }

    public static void validateDateRange(OffsetDateTime startDate, OffsetDateTime endDate) {
        if (startDate != null && endDate != null && !endDate.isAfter(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }

    public static String normalizeName(String name) {
        return StringUtils.hasText(name) ? name.trim() : name;
    }

    public static String normalizeDiscountType(String discountType) {
        String normalized = StringUtils.hasText(discountType) ? discountType.trim().toUpperCase(Locale.ROOT) : discountType;
        if (!SUPPORTED_DISCOUNT_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("Unsupported discount type: " + discountType);
        }
        return normalized;
    }

    public boolean hasSameNameIgnoreCase(String candidateName) {
        return StringUtils.hasText(name)
                && StringUtils.hasText(candidateName)
                && name.equalsIgnoreCase(candidateName);
    }

    public static Promotion createNew(
            String name,
            String description,
            String discountType,
            BigDecimal discountValue,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Boolean isActive) {
        OffsetDateTime now = OffsetDateTime.now();
        return Promotion.builder()
                .id(UUID.randomUUID())
                .name(normalizeName(name))
                .description(description)
                .discountType(normalizeDiscountType(discountType))
                .discountValue(discountValue)
                .startDate(startDate)
                .endDate(endDate)
                .isActive(isActive != null ? isActive : Boolean.TRUE)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public void applyUpdate(
            String name,
            String description,
            String discountType,
            BigDecimal discountValue,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Boolean isActive) {
        this.name = normalizeName(name);
        this.description = description;
        this.discountType = normalizeDiscountType(discountType);
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive != null ? isActive : this.isActive;
        this.updatedAt = OffsetDateTime.now();
    }
}
