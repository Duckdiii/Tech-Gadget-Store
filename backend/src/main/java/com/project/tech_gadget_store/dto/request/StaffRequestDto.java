package com.project.tech_gadget_store.dto.request;

import java.time.LocalDate;
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
public class StaffRequestDto {

    private String fullName;
    private String phone;
    private String staffCode;
    private LocalDate hireDate;
}
