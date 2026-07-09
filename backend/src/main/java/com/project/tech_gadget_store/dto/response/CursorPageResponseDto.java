package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPageResponseDto<T> {
    private List<T> items;
    private String nextCursor;
    private boolean hasNext;
}
