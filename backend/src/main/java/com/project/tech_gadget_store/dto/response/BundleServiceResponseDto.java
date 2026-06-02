package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.BundleServiceType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BundleServiceResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String name;
    private BundleServiceType type;
    private String description;
    private BigDecimal price;
    private Integer durationMonths;
    private Boolean active;
    private List<String> cartItemsIds;
    private List<String> orderItemsIds;
}
