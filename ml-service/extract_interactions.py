
import pandas as pd

from db import get_connection

PURCHASE_WEIGHT = 3
FAVORITE_WEIGHT = 1 #mua được tính nặng gấp 3 lần favorite — phản ánh đúng thực tế "đã bỏ tiền mua" là tín hiệu mạnh hơn nhiều "chỉ thích/xem qua"
ALPHA = 5 # tuned via tune_hyperparameters.py grid search (150-product catalog, 3402 orders) — alpha=5 outperformed 15/30

#cú pháp CTE (Common Table Expression) trong SQL — nó tạo ra một bảng tạm ảo, chỉ tồn tại trong phạm vi câu query này
# COALESCE: trả về giá trị đầu tiên không null trong danh sách các tham số. Ví dụ: COALESCE(NULL, NULL, 5, 6) = 5
#lưu trữ toàn bộ câu SQL dưới dạng chuỗi ký tự (string) trong Python — bản thân Python không hiểu gì về SQL cả, nó chỉ coi đây là 1 đoạn text dài, và Postgres mới là bên thực sự đọc hiểu, thực thi câu lệnh này.
_INTERACTIONS_QUERY = """
WITH purchases AS (
    SELECT o.customer_id, pv.product_id, COUNT(*) AS purchase_count
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN product_variants pv ON pv.id = oi.product_variant_id
    WHERE o.order_status <> 'CANCELLED'
    GROUP BY o.customer_id, pv.product_id
),
favorites AS (
    SELECT fp.customer_id, pv.product_id, COUNT(*) AS favorite_count
    FROM favorite_products fp
    JOIN product_variants pv ON pv.id = fp.product_variant_id
    WHERE fp.is_favorite = true
    GROUP BY fp.customer_id, pv.product_id
)
SELECT
    COALESCE(p.customer_id, f.customer_id) AS customer_id,
    COALESCE(p.product_id, f.product_id) AS product_id,
    COALESCE(p.purchase_count, 0) AS purchase_count,
    COALESCE(f.favorite_count, 0) AS favorite_count
FROM purchases p
FULL OUTER JOIN favorites f
    ON p.customer_id = f.customer_id AND p.product_id = f.product_id
"""


def extract_interactions() -> pd.DataFrame: #ma trận tương tác (customer, product) với điểm confidence
    #Mở kết nối và chạy query
    with get_connection() as conn:
        df = pd.read_sql(_INTERACTIONS_QUERY, conn)

    #Tính điểm confidence
    df["confidence"] = 1 + ALPHA * (
        df["purchase_count"] * PURCHASE_WEIGHT + df["favorite_count"] * FAVORITE_WEIGHT
    )
    return df[["customer_id", "product_id", "confidence"]]


if __name__ == "__main__":
    import sys

    sys.stdout.reconfigure(encoding="utf-8")

    result = extract_interactions()
    print(f"Trích xuất được {len(result)} cặp (customer, product) có tương tác.")
    print(result.sort_values("confidence", ascending=False).head(10).to_string(index=False))
