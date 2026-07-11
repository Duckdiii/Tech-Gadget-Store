# ml-service — Recommendation Matrix Factorization

Service Python độc lập, tách biệt khỏi backend Spring Boot, chịu trách nhiệm huấn luyện model **Matrix Factorization (ALS)** cho tính năng "Dành cho bạn" và ghi kết quả vào Postgres để backend đọc — Java không cần biết gì về Python/ML, chỉ đọc 1 bảng dữ liệu tĩnh (`customer_recommendation_cache`).

## Vì sao cần ML ở đây, và vì sao không dùng ở 2 tính năng recommendation còn lại

Dự án có 3 tính năng gợi ý sản phẩm; chỉ tính năng "Dành cho bạn" có ML, 2 tính năng còn lại (sản phẩm tương tự, khách hàng cũng mua) dùng SQL rule-based vì đã đủ tốt cho bài toán đó, không cần thêm độ phức tạp không mang lại giá trị. "Dành cho bạn" cần ML vì bài toán "customer này thích gì" không có công thức rule-based đơn giản nào diễn tả đủ tốt — cần model học pattern từ dữ liệu tương tác.

## Vì sao chọn ALS (Alternating Least Squares)

- Phù hợp với **implicit feedback** (mua/không mua, không có rating 1-5 sao tường minh) — công thức confidence-weighted của ALS (theo paper Hu/Koren/Volinsky) xử lý đúng loại tín hiệu này.
- Dễ giải thích trực quan (`R ≈ U × Vᵀ`, mỗi vòng lặp giải luân phiên U rồi V) so với BPR hay deep learning.
- Thư viện `implicit` hỗ trợ sẵn, hiệu năng tốt ngay cả khi chạy CPU, phù hợp quy mô dữ liệu hiện tại (vài trăm customer, vài trăm sản phẩm).

## Setup

```bash
cd ml-service
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
# hoặc: .venv/bin/pip install -r requirements.txt               # Linux/Mac
```

Kết nối DB được đọc trực tiếp từ `backend/.env` (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) — không tạo config riêng, tránh 2 nơi lưu credentials lệch nhau (xem `config.py`).

## Pipeline — chạy theo đúng thứ tự

| Bước | Script | Việc làm |
|---|---|---|
| 0 | `check_connection.py` | Sanity check — xác nhận kết nối đúng DB backend đang dùng |
| 1 | `extract_interactions.py` | Query `order_items` + `favorite_products`, tính điểm `confidence` cho từng cặp (customer, product) |
| 2 | `train_model.py` | Dựng ma trận thưa, train `AlternatingLeastSquares`, lưu model + mapping id vào `models/` |
| 3 | `evaluate_model.py` | Chia train/test theo thời gian, so sánh precision@6 giữa MF và baseline rule-based |
| 4 | `tune_hyperparameters.py` | Grid search `factors` × `regularization` × `alpha`, tìm cấu hình tốt nhất |
| 5 | `generate_recommendations.py` | Dùng model đã train, sinh top-6 cho mỗi customer, ghi đè vào bảng `customer_recommendation_cache` (Postgres) |

**Chạy lại khi có dữ liệu mới** (hiện tại thủ công, chưa có cron job — xem phần "Giới hạn & hướng mở rộng"):
```bash
./.venv/Scripts/python.exe train_model.py
./.venv/Scripts/python.exe generate_recommendations.py
```

## Confidence weighting — cách biến "mua/thích" thành 1 con số

```
confidence = 1 + alpha × (số lần mua × 3 + số lần yêu thích × 1)
```

- Mua được tính nặng gấp 3 lần yêu thích (bỏ tiền mua là tín hiệu mạnh hơn nhiều so với chỉ xem/thích).
- `alpha` là hệ số khuếch đại (theo paper implicit-feedback ALS gốc) — nếu không khuếch đại, chênh lệch "mua 1 lần" vs "mua 5 lần" quá nhỏ để model phân biệt rõ.

## Kết quả đánh giá (Precision@6)

Đo bằng cách chia dữ liệu theo thời gian (80% lượt mua cũ nhất → train, 20% gần nhất → test/ground-truth), tránh model "học thuộc" chính dữ liệu nó được chấm điểm.

| Giai đoạn | Rule-based (MVP) | MF (ALS) |
|---|---|---|
| Catalog nhỏ (30 sản phẩm, 300 customer) | **0.0822** | 0.0512 |
| Catalog lớn (150 sản phẩm, 300 customer), hyperparameter mặc định | 0.0369 | 0.0903 |
| Catalog lớn + đã tune hyperparameter | 0.0369 | **0.1087** |

**Insight quan trọng:** ở catalog nhỏ, rule-based đơn giản thắng MF — vì bài toán "quá dễ" (30 sản phẩm không đủ phức tạp để cá nhân hoá có giá trị hơn thống kê phổ biến). MF chỉ thực sự vượt trội khi catalog đủ lớn (150 sản phẩm) — đúng với nguyên lý thực tế: ML phức tạp chỉ đáng dùng khi bài toán đủ phức tạp để tận dụng nó.

Hyperparameter đã tune (grid search 27 tổ hợp, xem `tune_hyperparameters.py`): `factors=16, regularization=0.05, alpha=5`. Đáng chú ý: `factors=16` liên tục thắng `factors=32/64` — quy mô dữ liệu hiện tại chưa cần latent vector lớn hơn, tăng `factors` chỉ làm tăng nguy cơ overfit.

## Kiến trúc phục vụ (serving)

Model **không được gọi real-time** mỗi lần user tải trang — ALS là thuật toán batch, train xong ghi kết quả tĩnh vào bảng `customer_recommendation_cache`, backend Java chỉ `SELECT` từ bảng này. Xem [README gốc](../README.md) (mục "Dành cho bạn") để biết cách backend fallback về rule-based khi customer chưa có trong cache (cold-start, hoặc chưa kịp retrain).

## Giới hạn & hướng mở rộng

- **Chưa có cron job tự động retrain** — ở quy mô portfolio, chạy tay là đủ; nếu lên production, đây là nơi cần gắn scheduler (cron/Airflow) chạy `train_model.py` + `generate_recommendations.py` định kỳ (VD mỗi đêm).
- **Item cold-start**: sản phẩm chưa từng có ai mua/thích sẽ không được MF gợi ý (không có trong ma trận huấn luyện) — cũng được đỡ bởi lớp rule-based.
- **Thử BPR (Bayesian Personalized Ranking)** để so sánh với ALS — cùng thư viện `implicit`, phù hợp hơn cho bài toán xếp hạng top-N thuần túy thay vì dự đoán điểm số.
- **Deep learning (Neural Collaborative Filtering, two-tower model...)** chỉ đáng cân nhắc khi dữ liệu đủ lớn (hàng trăm nghìn+ tương tác) hoặc cần kết hợp thêm dữ liệu phi cấu trúc (ảnh, mô tả sản phẩm) — ở quy mô hiện tại sẽ overfit, không mang lại giá trị.
