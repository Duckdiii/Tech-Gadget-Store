package com.project.tech_gadget_store.modules.settings.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class StoreSettingsRequestDto {

    @NotBlank(message = "Tên cửa hàng không được để trống")
    private String storeName;

    @NotBlank(message = "Email liên hệ không được để trống")
    @Email(message = "Email liên hệ không hợp lệ")
    private String contactEmail;

    private String contactPhone;
    private String address;
    private boolean allowProductReviews;
}
