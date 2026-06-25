package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.Size;
import java.util.List;
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
public class UpdateCartItemBundleServicesRequestDto {

    @Size(max = 2, message = "bundleServicesIds must contain at most 2 items")
    private List<String> bundleServicesIds;
}
