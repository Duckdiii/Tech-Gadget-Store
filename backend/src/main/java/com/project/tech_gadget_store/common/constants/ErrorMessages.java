package com.project.tech_gadget_store.common.constants;

/**
 * User-facing messages that were duplicated verbatim across multiple modules before being
 * centralized here — keeps wording consistent and means a tone change (or a future move to
 * i18n) only touches one place instead of every call site that throws the same error.
 *
 * <p>Messages used in only one place are intentionally left as local literals; adding an entry
 * here is only worth it once a message is actually shared.
 */
public final class ErrorMessages {

    private ErrorMessages() {
    }

    public static final String CUSTOMER_NOT_FOUND = "Không tìm thấy khách hàng";
    public static final String ORDER_NOT_FOUND_PREFIX = "Đơn hàng không tồn tại: ";
    public static final String PAYMENT_INITIALIZATION_FAILED_PREFIX = "Lỗi khởi tạo thanh toán: ";
    public static final String PAYMENT_INITIATED_REDIRECT = "Khởi tạo thanh toán online thành công, chuyển hướng người dùng";
}
