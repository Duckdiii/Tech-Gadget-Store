

import os

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")  # avoid OpenBLAS/implicit thread contention

import pickle
from pathlib import Path

import pandas as pd
from implicit.als import AlternatingLeastSquares
from scipy.sparse import csr_matrix

from extract_interactions import extract_interactions

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "als_model.npz"
MAPPINGS_PATH = MODEL_DIR / "id_mappings.pkl"

FACTORS = 16 #số chiều của latent vector — tuned via tune_hyperparameters.py, 16 outperformed 32/64 at this data scale
REGULARIZATION = 0.05 #hệ số chống overfit — tuned via tune_hyperparameters.py
ITERATIONS = 20 #số vòng lặp huấn luyện


def build_sparse_matrix(df: pd.DataFrame):
    customer_cat = df["customer_id"].astype("category")
    product_cat = df["product_id"].astype("category")

    #csr_matrix((data, (row_indices, col_indices)), shape=(n_rows, n_cols))
    #"với mỗi phần tử thứ i, đặt giá trị data[i] vào vị trí hàng row_indices[i], cột col_indices[i]". Các phần tử còn lại không được liệt kê thì mặc định là 0.
    matrix = csr_matrix(
        (df["confidence"], (customer_cat.cat.codes, product_cat.cat.codes)),
        shape=(len(customer_cat.cat.categories), len(product_cat.cat.categories)),
    )
    return matrix, list(customer_cat.cat.categories), list(product_cat.cat.categories)


def train():
    df = extract_interactions()
    if df.empty:
        raise RuntimeError("Không có dữ liệu tương tác nào để train — hãy seed dữ liệu trước.")

    matrix, customer_ids, product_ids = build_sparse_matrix(df)

    model = AlternatingLeastSquares( # lúc này U, V chưa tồn tại, object chỉ mới cầm hyperparameter
        factors=FACTORS,
        regularization=REGULARIZATION,
        iterations=ITERATIONS,
    )
    #bên trong, thư viện implicit khởi tạo ngẫu nhiên hai mảng numpy
    #model.user_factors: shape (n_customers, factors)
    #model.item_factors: shape (n_products, factors)
    model.fit(matrix)

    MODEL_DIR.mkdir(exist_ok=True)
    model.save(str(MODEL_PATH))
    with open(MAPPINGS_PATH, "wb") as f:
        pickle.dump({"customer_ids": customer_ids, "product_ids": product_ids}, f)

    return model, matrix, customer_ids, product_ids


if __name__ == "__main__":
    import sys

    sys.stdout.reconfigure(encoding="utf-8")

    trained_model, interaction_matrix, customers, products = train()
    print(f"Train xong: {interaction_matrix.shape[0]} customers x {interaction_matrix.shape[1]} products")
    print(f"Model đã lưu vào: {MODEL_PATH}")
    print(f"Mapping id đã lưu vào: {MAPPINGS_PATH}")
