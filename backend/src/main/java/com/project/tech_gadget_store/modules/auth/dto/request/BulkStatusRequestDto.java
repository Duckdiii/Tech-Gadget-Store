package com.project.tech_gadget_store.modules.auth.dto.request;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkStatusRequestDto {
    private List<String> accountIds;
    private String status;
}
