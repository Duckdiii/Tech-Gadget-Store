# TechStore — Tech Gadget E-commerce Platform

Hệ thống bán lẻ thiết bị công nghệ full-stack (điện thoại, laptop, màn hình, tai nghe, đồng hồ thông minh) — gồm backend REST API, frontend đa vai trò (customer/staff/manager), và một service Python riêng cho hệ thống gợi ý sản phẩm (recommendation system) sử dụng Machine Learning.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security (JWT), Spring Data JPA/Hibernate, Spring WebSocket (STOMP), Spring AMQP |
| Database | PostgreSQL (Supabase) |
| Cache / Ephemeral data | Redis (rate limiting, lịch sử xem gần đây, JWT blacklist) |
| Message Queue | RabbitMQ (xử lý bất đồng bộ sau checkout) |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Axios |
| AI | Google Gemini API (`google-genai`) — chatbot tư vấn (function-calling) và tìm kiếm sản phẩm bằng ngôn ngữ tự nhiên |
| ML Service | Python, `implicit` (Matrix Factorization / ALS), pandas, scipy, psycopg2 |
| Thanh toán | COD, MoMo, VNPay (tích hợp redirect + IPN webhook) |
| API Docs | springdoc-openapi (Swagger UI tại `/swagger-ui.html`) |
| Giám sát & vận hành | Spring Actuator (`health`/`info`/`metrics`), Correlation ID logging (truy vết request qua các service/queue) |
| Kiểm thử | Backend: JUnit 5, Mockito, AssertJ, MockMvc, Testcontainers (262 test case). Frontend: Vitest, React Testing Library (288 test case). E2E: Playwright (Page Object Model). Performance: k6 |
| CI/CD | GitHub Actions — CI (test backend + lint/test/build frontend) → deploy song song Production/Staging (Railway + Vercel, hạ tầng tách biệt hoàn toàn) → E2E test tự động trên Staging thật (Playwright) → performance test thủ công (k6); React Doctor quét sức khoẻ code React trên mỗi PR |

## Kiến trúc tổng quan

```
tech_gadget_store/
├── backend/       Spring Boot — modular monolith (REST API)
├── frontend/      React SPA — giao diện customer / staff / manager
└── ml-service/    Python — huấn luyện & phục vụ model recommendation (offline batch)
```

Backend chia theo domain module: `auth`, `catalog`, `order`, `payment`, `loyalty`, `notification`, `review`, `warehouse`, `chatbot`, `coupon`, `support`, `settings`, `stats`. Frontend chia theo vai trò: `customer-shop`, `customer-orders`, `customer-profile`, `staff-*` (bao gồm `staff-inventory`, `staff-fulfillment`, `staff-profile`), `manager-*`.

## Tính năng chính

### Khách hàng (Customer)
- Duyệt/tìm kiếm/lọc sản phẩm (bộ lọc đa tiêu chí: thương hiệu, giá, RAM, dung lượng, màu, chipset...), xem chi tiết, flash sale hàng ngày
- **Tìm kiếm bằng ngôn ngữ tự nhiên** — gõ câu hỏi tự do (vd. "điện thoại chụp ảnh đẹp dưới 15 triệu"), Gemini dịch thành bộ lọc có cấu trúc rồi chạy lại đúng API filter sẵn có
- **Trợ lý AI (chatbot)** tư vấn mua sắm, tra cứu sản phẩm/trạng thái đơn hàng, phản hồi streaming qua WebSocket, lưu lịch sử hội thoại
- Giỏ hàng, chọn dịch vụ đi kèm (bundle service) theo từng item
- Checkout, thanh toán qua COD / MoMo / VNPay
- Lịch sử đơn hàng, huỷ đơn, xem/tải hoá đơn PDF
- Quản lý hồ sơ, địa chỉ, phương thức thanh toán đã lưu
- Yêu thích sản phẩm (favorites/subscriptions), đánh giá & bình luận sản phẩm
- Xem hạng thành viên (membership tier) và quyền lợi
- Claim & quản lý mã giảm giá (coupon) cá nhân, dùng khi checkout
- Gửi & theo dõi yêu cầu hỗ trợ (support ticket) ngay trong hồ sơ tài khoản
- Thông báo trong ứng dụng (đẩy real-time qua WebSocket)
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
- Báo cáo **A/B test** cho gợi ý "Dành cho bạn" — so sánh CTR giữa MF và rule-based holdout (xem chi tiết bên dưới)
- Quản lý tài khoản nhân viên/khách hàng, log đăng nhập
- Báo cáo doanh thu (revenue report, xuất file)
- Cấu hình thông tin chung của cửa hàng (tên, liên hệ, địa chỉ, bật/tắt đánh giá sản phẩm)
- **Sao lưu & phục hồi dữ liệu** (backup/restore)

### Bảo mật & hạ tầng
- Xác thực JWT stateless, phân quyền theo route (`CUSTOMER` / `STAFF` / `MANAGER`)
- Rate-limiting (Redis) cho login/register/forgot-password/reset-password, mã hoá mật khẩu BCrypt
- Audit log đăng nhập, log thanh toán, log kho — phục vụ truy vết
- **Correlation ID** gắn vào mọi request (`CorrelationIdFilter`) và propagate xuống cả log của consumer RabbitMQ — truy vết 1 request xuyên suốt nhiều service/queue bằng 1 mã duy nhất
- **Actuator** (`/actuator/health`, `/actuator/info`, `/actuator/metrics`) cho health check & giám sát
- **Swagger UI** (`/swagger-ui.html`) tự sinh tài liệu API từ code

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

### A/B testing MF vs rule-based

Số liệu offline (precision@6) không chứng minh được model tốt hơn *trong thực tế sử dụng* — nên hệ thống tự chạy A/B test ngay trong lúc phục vụ, không cần hạ tầng thử nghiệm riêng:

- Khách hàng có sẵn kết quả MF trong `customer_recommendation_cache` được hash ổn định theo `customerId` để chia đôi: một nửa vẫn nhận MF, nửa còn lại bị giữ lại (`RULE_BASED_HOLDOUT`) và nhận gợi ý rule-based như cũ — cùng 1 khách luôn rơi vào đúng 1 nhóm giữa các lần gọi.
- Mỗi lần hiển thị gợi ý (impression) và mỗi lượt khách bấm vào đều được ghi vào `RecommendationExperimentLog`.
- Manager xem báo cáo CTR theo từng nhóm tại `GET /api/manager/recommendation-experiment/summary` (`RecommendationExperimentController`) để biết MF có thực sự đang chuyển đổi tốt hơn rule-based hay không, trước khi quyết định rollout 100%.

## Chatbot & Tìm kiếm bằng ngôn ngữ tự nhiên

Cả 2 tính năng đều dùng chung Google Gemini (`google-genai`), nhưng theo 2 cách khác nhau tuỳ bài toán:

| Tính năng | Cách dùng Gemini | Vì sao |
|---|---|---|
| Chatbot tư vấn (`ChatbotService`) | Function-calling — model tự quyết định gọi tool nào (`search_products`, `get_recommendations`, `get_order_status`), kết quả trả về là dữ liệu thật từ DB, model chỉ diễn giải thành câu trả lời | Hội thoại nhiều lượt, cần model tự suy luận nên tra cứu gì |
| Tìm kiếm tự nhiên (`ProductNlSearchService`) | Structured output (`responseSchema`) — ép model trả về đúng JSON khớp `ProductFilterRequestDto`, ràng buộc `brandNames`/`categoryNames` theo đúng danh sách thật trong DB để tránh bịa | Tác vụ 1 lượt, cần kết quả có cấu trúc để tái sử dụng ngay bộ lọc sản phẩm sẵn có, không cần hạ tầng tìm kiếm/vector DB mới |

Chatbot trả lời theo kiểu streaming qua WebSocket (`ChatWebSocketController`, đẩy từng đoạn vào `/queue/chatbot`), không phải chờ toàn bộ câu trả lời xong mới hiển thị. Cả 2 tính năng đều có fallback an toàn: chatbot từ chối trả lời ngoài phạm vi cửa hàng theo system prompt, tìm kiếm tự nhiên fallback về tìm theo từ khoá thường nếu Gemini lỗi hoặc chưa cấu hình API key.

## Redis

Giống tinh thần ở phần Recommendation — chỉ dùng Redis ở chỗ dữ liệu **thật sự có bản chất ngắn hạn/TTL**, không áp dụng tràn lan cho mọi thứ có thể cache được:

| Chỗ dùng | Cấu trúc Redis | Vì sao không để Postgres |
|---|---|---|
| Rate limiting login/register/forgot-password/reset-password (`AuthRateLimitFilter`, `RateLimiterService`) | String, `INCR` + `EXPIRE` (fixed-window counter) | Counter theo IP vốn chỉ cần sống đúng 1 cửa sổ thời gian (15 phút); lưu Postgres thì tốn 1 bảng và phải tự dọn |
| "Bạn vừa xem" / "Gợi ý từ lịch sử" (`RecentlyViewedService`) | Sorted Set theo customer, member = productId, score = thời điểm xem | Lịch sử xem là dữ liệu phiên, nên tự biến mất sau một thời gian không hoạt động; Sorted Set còn tự khử trùng lặp (xem lại 1 sản phẩm chỉ cập nhật thứ tự, không tạo dòng mới) |
| JWT blacklist khi logout (`JwtService.invalidateToken`) | String, TTL = thời gian còn lại tới hạn `exp` của token | Token bị vô hiệu hoá cũng chỉ cần "sống" đến đúng lúc nó tự hết hạn theo JWT — sau đó giữ lại vô nghĩa; trước đây lưu Postgres (`invalidated_tokens`) nhưng không có job dọn nên bảng phình to mãi |

**Cố tình không dùng Redis** cho cache "Dành cho bạn" (`customer_recommendation_cache`) — đây là bảng Postgres do `ml-service` ghi theo batch offline, bản thân nó đã là kết quả tính sẵn (đọc theo `customerId` có index), không phải dữ liệu cần hết hạn. Giỏ hàng của khách đã đăng nhập cũng giữ nguyên Postgres vì cần bền vững qua nhiều thiết bị/phiên đăng nhập.

## RabbitMQ

Sau khi checkout thành công (trừ kho + lưu đơn + khởi tạo thanh toán xong), `CheckoutFacade` publish 1 message `OrderPlacedMessage` (chỉ chứa `orderId`) vào exchange `order.placed.exchange` rồi trả response ngay — không chờ 3 việc phụ dưới đây xử lý xong:

| Queue | Consumer | Việc làm |
|---|---|---|
| `order.email.queue` | `OrderEmailConsumer` | Gửi email xác nhận đặt hàng |
| `order.invoice.queue` | `OrderInvoiceConsumer` | Tạo trước `Invoice` (khách xem hoá đơn sau này thấy ngay, không phải đợi tạo mới) |
| `order.notification.queue` | `OrderNotificationConsumer` | Tạo thông báo trong app (chuông thông báo ở `StoreNavbar`) |

Mỗi queue có cấu hình dead-letter (`order.placed.dlx`/`order.placed.dlq`) — message xử lý lỗi liên tục (Spring AMQP tự retry 3 lần, cấu hình ở `spring.rabbitmq.listener.simple.retry` trong `application.yml`) sẽ rơi vào đây thay vì mất, có chỗ xem lại sau.

Chạy RabbitMQ local:
```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
Management UI xem queue/exchange trực quan tại `http://localhost:15672` (mặc định `guest`/`guest`). Đổi host/port/user/pass qua `RABBITMQ_HOST`/`RABBITMQ_PORT`/`RABBITMQ_USERNAME`/`RABBITMQ_PASSWORD` nếu cần.

## Kiểm thử

**Backend:** 33 file test (262 test case), đặt cạnh code ở `backend/src/test/java`. Phần lớn (27 file) là unit test tầng service với JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`, mock toàn bộ repository/client bên ngoài) + AssertJ cho assertion — logic nghiệp vụ (tính giá, áp khuyến mãi, phân quyền xoá tài khoản...) không cần DB thật mới verify được, nên chạy nhanh và không phụ thuộc môi trường. Riêng với query native (full-text search) thì mock không đủ tin cậy — `ProductRepositoryIntegrationTest` dùng Testcontainers dựng một Postgres thật, chạy lại đúng migration Flyway rồi verify query trên schema thật.

```bash
cd backend
./mvnw test
```

**Frontend:** 52 file test (288 test case), unit test hook/component với Vitest + React Testing Library, đặt cạnh code theo tên file (`*.test.jsx`/`*.test.js`), mock tầng service (axios) để test logic hook độc lập với API thật.

```bash
cd frontend
npm run test    # chạy 1 lần
npm run lint    # ESLint
```

**E2E (Playwright):** test luồng mua hàng cốt lõi thật — đăng nhập → tìm sản phẩm → thêm giỏ hàng → checkout COD → xác nhận thành công — chạy trên trình duyệt thật, nhắm vào môi trường Staging đã deploy (không phải mock). Đặt ở `frontend/e2e/`, theo Page Object Model (`e2e/pages/`), đăng nhập 1 lần rồi tái sử dụng session qua `storageState` để tránh chạm rate limit của `/api/auth/login`.

```bash
cd frontend
E2E_BASE_URL=https://tech-gadget-store-staging.vercel.app npx playwright test
```

**Performance (k6):** load test luồng đọc (danh sách/tìm kiếm/chi tiết sản phẩm) trên Staging, threshold p95 latency < 800ms và error rate < 1%. Đặt ở `performance/product-browsing.js`, chạy thủ công qua GitHub Actions hoặc trực tiếp:

```bash
k6 run -e PERF_BASE_URL=https://tech-gadget-store-staging.up.railway.app performance/product-browsing.js
```

Toàn bộ pipeline CI/CD (thứ tự chạy, hạ tầng Staging/Production tách biệt ra sao) — xem phần **CI/CD** bên dưới.

## CI/CD

3 workflow GitHub Actions, tách theo mục đích thay vì gộp chung một file:

| Workflow | Trigger | Việc làm |
|---|---|---|
| `ci.yml` — `backend` + `frontend` | mọi push/PR vào `main`/`dev` | Test backend (kèm Postgres/Redis/RabbitMQ thật qua service container) + lint/test/build frontend |
| `ci.yml` — `Deploy to Production` | push vào `main`, sau khi CI pass | Deploy Railway + Vercel (prod), smoke test `/actuator/health` trước khi coi là thành công |
| `ci.yml` — `Deploy to Staging` | push vào `dev`, sau khi CI pass | Deploy vào hạ tầng **tách biệt hoàn toàn** khỏi Production: Railway environment riêng, Supabase DB riêng, Redis/RabbitMQ riêng. Frontend deploy dạng Vercel Preview rồi `alias` cố định vào `tech-gadget-store-staging.vercel.app` |
| `ci.yml` — `E2E Test (Staging)` | ngay sau khi Deploy to Staging xong | Playwright chạy golden path thật trên Staging vừa deploy |
| `performance.yml` | thủ công (`workflow_dispatch`) | k6 load test trên Staging |
| `react-doctor.yml` | mọi PR + push vào `main` | Quét security/perf/a11y/architecture cho code React, advisory (không chặn merge) |

**Vì sao Staging tách biệt hoàn toàn khỏi Production** (không dùng chung DB/Redis/RabbitMQ): E2E test và load test cần ghi dữ liệu thật (tạo đơn hàng, trừ tồn kho...) mà không được đụng tới dữ liệu Production; đồng thời một lỗi cấu hình/deploy ở Staging không được phép ảnh hưởng tới Production.

**Vì sao Performance Test chỉ chạy thủ công**, không tự động theo mỗi push như E2E: Staging chạy trên hạ tầng free-tier (Supabase, Railway) — load test lặp lại tự động trên mỗi commit có thể chạm giới hạn tài nguyên hoặc phát sinh chi phí ngoài ý muốn.

## Dữ liệu giả (seed data)

Vì chưa có traffic thật, dữ liệu customer/order/catalog được sinh giả **có chủ đích** (không random thuần) qua các seeder ở `backend/src/main/java/.../seed/`, để dữ liệu mô phỏng đúng hành vi mua sắm thật:

- `CatalogSeeder` — sinh danh mục sản phẩm (150 sản phẩm, 9 thương hiệu, 5 danh mục)
- `PersonaCatalog` — định nghĩa 6 persona hành vi mua hàng (Apple Ecosystem, Gamer, Budget Android...), mỗi persona có mức độ ưa thích riêng với từng cặp (danh mục, thương hiệu)
- `CustomerOrderSeeder` — sinh 300 khách hàng, mỗi người được gán ngẫu nhiên 1 persona theo trọng số, rồi sinh đơn hàng/yêu thích thiên lệch theo persona đó — đảm bảo dữ liệu có **cấu trúc ẩn thật sự** để model học, thay vì nhiễu ngẫu nhiên vô nghĩa
- `ProductSerialSeeder` — sinh `product_serials` (số serial thật theo từng đơn vị tồn kho) cho mọi variant: 1 serial trạng thái `SOLD` gắn với mỗi order item đã seed (phục vụ tra cứu bảo hành), cộng thêm một lượng serial `IN_STOCK` ngẫu nhiên mỗi variant — nếu thiếu seeder này, `availableCount` của mọi sản phẩm sẽ luôn bằng 0

Chạy seed: `./mvnw spring-boot:run -Dspring-boot.run.profiles=seed` (chỉ chạy khi DB rỗng, tự bỏ qua nếu đã có dữ liệu).

## Chạy dự án

### Chạy nhanh bằng Docker Compose (khuyến nghị nếu chỉ muốn xem thử)

Chỉ cần cài [Docker](https://www.docker.com/) — không cần cài Java/Node/Python hay tự tạo `.env`. Toàn bộ stack (Postgres, Redis, RabbitMQ, backend, frontend) tự dựng và tự sinh dữ liệu mẫu (150 sản phẩm, 300 khách hàng theo persona) ngay lần chạy đầu:

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: `http://localhost:8081` (map ra 8081 vì 8080 dễ bị tiến trình khác trên máy chiếm — đổi lại trong `docker-compose.yml` nếu muốn)
- RabbitMQ management UI: `http://localhost:15672` (`guest`/`guest`)

Postgres ở đây là một database **local, rỗng, riêng biệt** dựng ngay trong Docker — không liên quan tới Supabase dùng cho môi trường dev thật, nên không cần bất kỳ credentials nào của tác giả. Dữ liệu được giữ lại qua Docker volume, tắt/bật lại (`docker compose up`) không mất dữ liệu và không seed trùng lặp.

`ml-service` không chạy mặc định (đây là các script batch train/generate, không phải web server) — chạy thử qua profile riêng:
```bash
docker compose --profile ml run ml-service python check_connection.py
```

### Chạy thủ công (dành cho dev hằng ngày, có hot-reload)

**Backend** (cần `backend/.env` với `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` trỏ tới Postgres, một Redis đang chạy — mặc định `localhost:6379`, và một RabbitMQ đang chạy — mặc định `localhost:5672`, đổi qua `REDIS_HOST`/`REDIS_PORT`/`RABBITMQ_HOST`/`RABBITMQ_PORT` nếu cần):
```bash
docker run -p 6379:6379 redis   # hoặc Redis cài native
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
cd backend
./mvnw spring-boot:run
```
Mặc định chạy ở port 8080. Thêm `GEMINI_API_KEY` vào `.env` để bật chatbot/tìm kiếm AI thật — thiếu biến này cả 2 tính năng vẫn chạy được nhờ fallback (chatbot báo lỗi thân thiện, tìm kiếm AI lùi về tìm theo từ khoá thường).

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Chạy ở port 5173, proxy `/api` sang backend (xem `vite.config.js`).

**ml-service** — xem hướng dẫn setup & pipeline đầy đủ ở [ml-service/README.md](ml-service/README.md).
