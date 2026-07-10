// Backend hiện chưa có endpoint tự-phục vụ cho staff (chỉ có /api/manager/staff
// dành cho manager quản lý nhân viên khác, không phải cho staff tự xem/sửa hồ sơ
// hoặc đổi mật khẩu của chính họ). Các hàm dưới đây giữ vai trò của service layer
// theo đúng cấu trúc Feature-Driven, nhưng tạm thời chỉ mô phỏng cục bộ cho đến
// khi backend bổ sung API tương ứng.
export const staffProfileService = {
  async changePassword({ current, next }) {
    return new Promise((resolve) => setTimeout(resolve, 300))
  },
}
