

import os

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

import sys

import pandas as pd
from implicit.als import AlternatingLeastSquares

from db import get_connection
from extract_interactions import ALPHA, FAVORITE_WEIGHT, PURCHASE_WEIGHT
from train_model import FACTORS, ITERATIONS, REGULARIZATION, build_sparse_matrix

TEST_SPLIT_PERCENTILE = 0.8 #80% dữ liệu cũ nhất dùng để train, 20% dữ liệu mới nhất giữ lại làm test
TOP_N = 6


# câu truy vấn này là union của hai truy vấn con: một truy vấn lấy ra các lượt mua, một truy vấn lấy ra các lượt favorite. Mỗi lượt mua/favorite được coi là một event, có 4 cột: customer_id, product_id, event_time, event_type
#lấy toàn bộ lượt mua của mọi customer, mỗi dòng là 1 sản phẩm trong 1 đơn hàng, kèm customer_id để biết đó là của ai
#lấy toàn bộ lượt favorite của mọi customer
#UNION ALL gộp 2 danh sách đó thành 1 bảng phẳng duy nhất
_EVENTS_QUERY = """
SELECT o.customer_id, pv.product_id, o.order_date AS event_time, 'purchase' AS event_type
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN product_variants pv ON pv.id = oi.product_variant_id
WHERE o.order_status <> 'CANCELLED'
UNION ALL
SELECT fp.customer_id, pv.product_id, fp.subscribed_at AS event_time, 'favorite' AS event_type
FROM favorite_products fp
JOIN product_variants pv ON pv.id = fp.product_variant_id
WHERE fp.is_favorite = true
"""

_PRODUCT_CATEGORY_QUERY = "SELECT id AS product_id, category_id FROM products"

#thực thi _EVENTS_QUERY và trả về kết quả dưới dạng DataFrame
def _load_events() -> pd.DataFrame:
    with get_connection() as conn:
        return pd.read_sql(_EVENTS_QUERY, conn)

#thực thi _PRODUCT_CATEGORY_QUERY và trả về kết quả dưới dạng DataFrame
def _load_product_categories() -> pd.DataFrame:
    with get_connection() as conn:
        return pd.read_sql(_PRODUCT_CATEGORY_QUERY, conn)

s
def _split_train_test(events: pd.DataFrame):
    purchase_times = events.loc[events["event_type"] == "purchase", "event_time"]
    cutoff = purchase_times.quantile(TEST_SPLIT_PERCENTILE)
    train_events = events[events["event_time"] <= cutoff]
    test_purchases = events[(events["event_time"] > cutoff) & (events["event_type"] == "purchase")]
    return train_events, test_purchases, cutoff


def _build_train_confidence( #tính confidence cho từng cặp customer-product
        train_events: pd.DataFrame, alpha: float = ALPHA, purchase_weight: float = PURCHASE_WEIGHT, 
        favorite_weight: float = FAVORITE_WEIGHT) -> pd.DataFrame:
    counts = (
        train_events.groupby(["customer_id", "product_id", "event_type"]).size().unstack(fill_value=0)
    ) #Đếm số lần mua/favorite theo từng cặp
    for col in ("purchase", "favorite"): #Xử lý trường hợp thiếu hẳn 1 cột

        if col not in counts.columns:
            counts[col] = 0

    counts["confidence"] = 1 + alpha * (
        counts["purchase"] * purchase_weight + counts["favorite"] * favorite_weight
    )
    return counts.reset_index()[["customer_id", "product_id", "confidence"]]

#biến bảng test_purchases (các lượt mua thuộc tập test, đã tách ra ở _split_train_test()) thành "đáp án đúng" để so sánh với gợi ý của model
def _test_ground_truth(test_purchases: pd.DataFrame) -> dict:
    #"A": {"iPhone", "AirPods"},
    #"B": {"MacBook"},
    return test_purchases.groupby("customer_id")["product_id"].apply(set).to_dict()

#tính 1 con số điểm duy nhất cho 1 customer — đo "trong số gợi ý đưa ra, bao nhiêu phần trăm là đúng"
def _precision_at_k(recommended: list, actual: set, k: int = TOP_N):
    if not actual:
        return None
    hits = len(set(recommended[:k]) & actual)
    return hits / k


def evaluate_mf(
        train_confidence_df: pd.DataFrame, ground_truth: dict, factors: int = FACTORS,
        regularization: float = REGULARIZATION, iterations: int = ITERATIONS) -> float:
    matrix, customer_ids, product_ids = build_sparse_matrix(train_confidence_df) #Dựng ma trận thưa
    #Tạo 2 dictionary tra cứu ngược/xuôi
    customer_index = {cid: i for i, cid in enumerate(customer_ids)} #những customer có ít nhất 1 tương tác (mua/favorite) trong tập train
    product_id_by_index = {i: pid for i, pid in enumerate(product_ids)} #những sản phẩm có xuất hiện trong dữ liệu train 


    #Train model
    model = AlternatingLeastSquares(factors=factors, regularization=regularization, iterations=iterations)
    model.fit(matrix)

    #Vòng lặp chấm điểm từng customer
    scores = []
    for customer_id, actual_products in ground_truth.items():
        #Duyệt qua toàn bộ customer có dữ liệu test 
        if customer_id not in customer_index:
            continue
        
        idx = customer_index[customer_id]
        #matrix[idx]: hàng dữ liệu tương tác của customer đó
        recommended_indices, _ = model.recommend(idx, matrix[idx], N=TOP_N, filter_already_liked_items=True)
        
        recommended_products = [product_id_by_index[i] for i in recommended_indices] #  Chuyển từ index sang product_id thực tế
        score = _precision_at_k(recommended_products, actual_products)
        if score is not None:
            scores.append(score)
    return sum(scores) / len(scores) if scores else 0.0


def evaluate_mvp(train_events: pd.DataFrame, product_categories: pd.DataFrame, ground_truth: dict) -> float:
    purchases = train_events[train_events["event_type"] == "purchase"]
    purchases = purchases.merge(product_categories, on="product_id", how="left")

    global_top_sellers = purchases["product_id"].value_counts().index.tolist()
    top_sellers_by_category = (
        purchases.groupby("category_id")["product_id"].apply(lambda s: s.value_counts().index.tolist()).to_dict()
    )
    bought_in_train = purchases.groupby("customer_id")["product_id"].apply(set).to_dict()
    categories_bought_in_train = purchases.groupby("customer_id")["category_id"].apply(set).to_dict()

    scores = []
    for customer_id, actual_products in ground_truth.items():
        already_bought = bought_in_train.get(customer_id, set())
        categories = categories_bought_in_train.get(customer_id, set())

        candidates = []
        for category_id in categories:
            candidates.extend(top_sellers_by_category.get(category_id, []))
        candidates.extend(global_top_sellers)  # fallback/padding, same as the Java service

        recommended, seen = [], set()
        for product_id in candidates:
            if product_id in already_bought or product_id in seen:
                continue
            seen.add(product_id)
            recommended.append(product_id)
            if len(recommended) >= TOP_N:
                break

        score = _precision_at_k(recommended, actual_products)
        if score is not None:
            scores.append(score)
    return sum(scores) / len(scores) if scores else 0.0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")

    events = _load_events()
    product_categories = _load_product_categories()
    train_events, test_purchases, cutoff = _split_train_test(events)
    ground_truth = _test_ground_truth(test_purchases)

    print(f"Mốc thời gian cắt train/test: {cutoff}")
    print(f"Số event train: {len(train_events)}, số lượt mua ở test: {len(test_purchases)}")
    print(f"Số customer có dữ liệu test để đánh giá: {len(ground_truth)}")

    train_confidence_df = _build_train_confidence(train_events)

    mvp_precision = evaluate_mvp(train_events, product_categories, ground_truth)
    mf_precision = evaluate_mf(train_confidence_df, ground_truth)

    print(f"\nPrecision@{TOP_N}:")
    print(f"  MVP (top-seller theo category): {mvp_precision:.4f}")
    print(f"  MF  (ALS matrix factorization): {mf_precision:.4f}")
