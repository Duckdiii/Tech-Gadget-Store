package com.project.tech_gadget_store.common.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPageResponseDto<T> {
    private List<T> items;
    private String nextCursor;
    private boolean hasNext;
}
