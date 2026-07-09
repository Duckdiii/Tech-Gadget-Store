package com.project.tech_gadget_store.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponseDto {
    private String productId;
    private String productName;
    private boolean isFavorite;
    private String message;
}
