# TechStore — Tech Gadget E-commerce Platform

Hệ thống bán lẻ thiết bị công nghệ full-stack (điện thoại, laptop, màn hình, tai nghe, đồng hồ thông minh) — gồm backend REST API, frontend đa vai trò (customer/staff/manager), và một service Python riêng cho hệ thống gợi ý sản phẩm (recommendation system) sử dụng Machine Learning.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security (JWT), Spring Data JPA/Hibernate |
| Database | PostgreSQL (Supabase) |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Axios |
| ML Service | Python, `implicit` (Matrix Factorization / ALS), pandas, scipy, psycopg2 |
| Thanh toán | COD, MoMo, VNPay (tích hợp redirect + IPN webhook) |

## Kiến trúc tổng quan

```
tech_gadget_store/
├── backend/       Spring Boot — modular monolith (REST API)
├── frontend/      React SPA — giao diện customer / staff / manager
└── ml-service/    Python — huấn luyện & phục vụ model recommendation (offline batch)
```

Backend chia theo domain module: `auth`, `catalog`, `order`, `payment`, `loyalty`, `notification`, `review`, `warehouse`. Frontend chia theo vai trò: `customer-shop`, `customer-orders`, `customer-profile`, `staff-*`, `manager-*`.

## Tính năng chính

### Khách hàng (Customer)
- Duyệt/tìm kiếm/lọc sản phẩm, xem chi tiết, flash sale hàng ngày
- Giỏ hàng, chọn dịch vụ đi kèm (bundle service) theo từng item
- Checkout, thanh toán qua COD / MoMo / VNPay
- Lịch sử đơn hàng, huỷ đơn, xem/tải hoá đơn PDF
- Quản lý hồ sơ, địa chỉ, phương thức thanh toán đã lưu
- Yêu thích sản phẩm (favorites/subscriptions), đánh giá & bình luận sản phẩm
- Xem hạng thành viên (membership tier) và quyền lợi
- Thông báo trong ứng dụng
- **Gợi ý sản phẩm cá nhân hoá** (xem chi tiết bên dưới)

### Nhân viên (Staff)
- Nhập kho / xuất kho, theo dõi lịch sử nhập-xuất
- Xử lý đơn hàng (fulfillment), dashboard riêng
- Quản lý hồ sơ cá nhân

### Quản lý (Manager)
- Quản lý sản phẩm, biến thể (variant), hình ảnh, thương hiệu, danh mục
- Quản lý kho: nhà cung cấp, đơn nhập hàng (supply order), log nhập/xuất kho
- Tra cứu bảo hành theo số serial
- Quản lý đơn hàng toàn hệ thống, log giao dịch thanh toán
- Quản lý khuyến mãi (kèm báo cáo hiệu quả từng chương trình), hạng thành viên, dịch vụ bundle
- Quản lý tài khoản nhân viên/khách hàng, log đăng nhập
- Báo cáo doanh thu (revenue report, xuất file)
- **Sao lưu & phục hồi dữ liệu** (backup/restore)

### Bảo mật & hạ tầng
- Xác thực JWT stateless, phân quyền theo route (`CUSTOMER` / `STAFF` / `MANAGER`)
- Rate-limiting cho đăng nhập, mã hoá mật khẩu BCrypt
- Audit log đăng nhập, log thanh toán, log kho — phục vụ truy vết

## Hệ thống Recommendation

Đây là phần được đầu tư kỹ nhất về mặt kỹ thuật — 3 tính năng gợi ý, mỗi tính năng chọn đúng mức độ phức tạp cần thiết thay vì áp ML vào mọi chỗ:

| Tính năng | Vị trí hiển thị | Kỹ thuật |
|---|---|---|
| Sản phẩm tương tự | Trang chi tiết sản phẩm | Content-based: chấm điểm theo brand/giá/RAM/storage |
| Khách hàng cũng mua | Trang chi tiết sản phẩm, giỏ hàng | Co-occurrence: đếm tần suất mua chung qua `order_items` |
| Dành cho bạn | Trang chủ (đã đăng nhập) | Rule-based (MVP) + Matrix Factorization (ALS), có cache |

Toàn bộ logic nằm ở `RecommendationController` / `RecommendationService` (module `catalog`), các query hiệu năng cao (native SQL) ở `ProductRepository` / `OrderRepository`.

### "Dành cho bạn" — kiến trúc 2 lớp (MVP + ML)

```
Customer request → RecommendationService.getForYouRecommendations()
                        │
                        ├─ Có trong customer_recommendation_cache? ──► dùng kết quả MF (ml-service tính sẵn)
                        │
                        └─ Không có (cold-start / model chưa kịp retrain) ──► fallback rule-based
                                                                              (top-seller theo category đã mua)
```

MF không thay thế lớp rule-based — 2 lớp tồn tại song song: MF phục vụ customer đã có lịch sử mua hàng, rule-based đỡ lưng cho customer mới hoặc khi model chưa kịp retrain (ALS là thuật toán batch/offline, không học liên tục theo thời gian thực — cần chạy lại định kỳ để cập nhật dữ liệu mới).

**Kết quả đo được (precision@6, so với baseline rule-based):** MF vượt trội gấp ~3 lần sau khi mở rộng catalog và tune hyperparameter. Chi tiết đầy đủ về training pipeline, lý do chọn thuật toán, cách đánh giá, và các quyết định kỹ thuật: xem **[ml-service/README.md](ml-service/README.md)**.

## Dữ liệu giả (seed data)

Vì chưa có traffic thật, dữ liệu customer/order/catalog được sinh giả **có chủ đích** (không random thuần) qua các seeder ở `backend/src/main/java/.../seed/`, để dữ liệu mô phỏng đúng hành vi mua sắm thật:

- `CatalogSeeder` — sinh danh mục sản phẩm (150 sản phẩm, 9 thương hiệu, 5 danh mục)
- `PersonaCatalog` — định nghĩa 6 persona hành vi mua hàng (Apple Ecosystem, Gamer, Budget Android...), mỗi persona có mức độ ưa thích riêng với từng cặp (danh mục, thương hiệu)
- `CustomerOrderSeeder` — sinh 300 khách hàng, mỗi người được gán ngẫu nhiên 1 persona theo trọng số, rồi sinh đơn hàng/yêu thích thiên lệch theo persona đó — đảm bảo dữ liệu có **cấu trúc ẩn thật sự** để model học, thay vì nhiễu ngẫu nhiên vô nghĩa

Chạy seed: `./mvnw spring-boot:run -Dspring-boot.run.profiles=seed` (chỉ chạy khi DB rỗng, tự bỏ qua nếu đã có dữ liệu).

## Chạy dự án

**Backend** (cần `backend/.env` với `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` trỏ tới Postgres):
```bash
cd backend
./mvnw spring-boot:run
```
Mặc định chạy ở port 8080.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Chạy ở port 5173, proxy `/api` sang backend (xem `vite.config.js`).

**ml-service** — xem hướng dẫn setup & pipeline đầy đủ ở [ml-service/README.md](ml-service/README.md).
