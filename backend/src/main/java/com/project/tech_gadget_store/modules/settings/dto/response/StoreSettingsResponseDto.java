package com.project.tech_gadget_store.modules.settings.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSettingsResponseDto {
    private String storeName;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private boolean allowProductReviews;
    private LocalDateTime updatedAt;
}
