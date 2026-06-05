package com.project.tech_gadget_store.dto.response;

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
public class ProductResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String name;
    private String description;
    private String brandId;
    private String categoryId;
    private List<String> imagesIds;
    private String specId;
    private List<String> variantsIds;
    private List<String> promotionsIds;
    private List<String> productSubscriptionsIds;
}
