"""Loads the trained ALS model and writes each customer's top-6 recommendations into
customer_recommendation_cache, so the Spring Boot backend can serve "Dành cho bạn" without
needing to know anything about Python/ALS — it just reads a plain table.

Run this right after train_model.py, against the same data snapshot: the model's
customer_ids/product_ids index mapping only makes sense relative to the interaction matrix
it was actually trained on, so this script rebuilds that exact matrix from the current DB
state rather than assuming nothing changed in between.
"""

import os

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

import sys
from datetime import datetime

from implicit.cpu.als import AlternatingLeastSquares
from psycopg2.extras import execute_values

from db import get_connection
from extract_interactions import extract_interactions
from train_model import MODEL_PATH, build_sparse_matrix

TOP_N = 6

_DELETE_QUERY = "DELETE FROM customer_recommendation_cache"
_INSERT_QUERY = """
    INSERT INTO customer_recommendation_cache (customer_id, product_id, rank, score, generated_at)
    VALUES %s
"""


def generate_recommendations():
    model = AlternatingLeastSquares.load(str(MODEL_PATH))

    df = extract_interactions()
    matrix, customer_ids, product_ids = build_sparse_matrix(df)

    generated_at = datetime.now()
    rows = []
    for idx, customer_id in enumerate(customer_ids):
        recommended_indices, scores = model.recommend(
                idx, matrix[idx], N=TOP_N, filter_already_liked_items=True)
        for rank, (product_index, score) in enumerate(zip(recommended_indices, scores)):
            rows.append((customer_id, product_ids[product_index], rank, float(score), generated_at))

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(_DELETE_QUERY)
            if rows:
                execute_values(cur, _INSERT_QUERY, rows)
        conn.commit()
    finally:
        conn.close()

    return rows


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")

    written_rows = generate_recommendations()
    distinct_customers = len({row[0] for row in written_rows})
    print(f"Đã ghi {len(written_rows)} dòng gợi ý cho {distinct_customers} customer "
          f"vào customer_recommendation_cache.")
