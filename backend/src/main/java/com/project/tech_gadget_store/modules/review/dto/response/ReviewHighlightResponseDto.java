package com.project.tech_gadget_store.modules.review.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewHighlightResponseDto {
    private String id;
    private String userName;
    private String productName;
    private String content;
    private Integer rating;
    private LocalDateTime createdAt;
}
