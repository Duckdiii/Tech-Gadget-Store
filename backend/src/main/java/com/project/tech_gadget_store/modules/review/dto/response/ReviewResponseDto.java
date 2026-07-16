package com.project.tech_gadget_store.modules.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private String id;
    private String productId;
    private String userId;
    private String userName;
    private String content;
    private Integer rating;
    private String parentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ReviewResponseDto> replies;
    // true nếu review này thuộc về người đang gọi API — dùng để FE hiện nút xoá đúng chỗ,
    // không cần lộ userId/email thật ra ngoài để so khớp.
    private boolean mine;
}
