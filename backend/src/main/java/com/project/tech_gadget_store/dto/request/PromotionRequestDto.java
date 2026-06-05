package com.project.tech_gadget_store.dto.request;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRequestDto {

    private String code;
    private String name;
    private Double discountPercent;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Boolean active;
    private String productId;
}
